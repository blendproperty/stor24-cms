"""Run only in the disposable networkless Ubuntu fixture; Docker/DB CLI is stubbed."""
import json
import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

assert os.geteuid() == 0 and Path('/CMS_RELEASE_ISOLATED_FIXTURE').exists()
ROOT = Path('/opt/stor24-cms')
RELEASES = Path('/opt/stor24-cms-releases')
BACKUPS = Path('/root/stor24-cms-releases')
STATE = Path('/tmp/cms-lifecycle-state.json')
SCRIPT = '/staging/host-cms-release.sh'


class LifecycleTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        fixture = Path('/fixture-bin')
        fixture.mkdir()
        shutil.copy('/staging/docker-fixture.py', fixture / 'docker')
        (fixture / 'docker').chmod(0o755)
        (fixture / 'sleep').write_text('#!/bin/sh\nexit 0\n')
        (fixture / 'sleep').chmod(0o755)
        cls.env = dict(os.environ, PATH='/fixture-bin:/usr/bin:/bin')
        cls.config = {'services': {'stor24-cms': {'build': {'context': '.'},
            'image': 'stor24-cms:contract-validation', 'networks': ['root_default'],
            'volumes': ['stor24-cms_stor24_media:/app/media']}}}
        (ROOT / 'docker-compose.yml').write_text(json.dumps(cls.config))
        (ROOT / 'package.json').write_text('{"name":"synthetic-cms-release"}')
        (ROOT / '.gitignore').write_text('.env\n')
        def git(*args):
            return subprocess.check_output(['git', '-C', str(ROOT), *args], stderr=subprocess.DEVNULL).decode().strip()
        git('init', '-b', 'main')
        git('config', 'user.name', 'Synthetic fixture')
        git('config', 'user.email', 'fixture@example.invalid')
        git('add', 'docker-compose.yml', 'package.json', '.gitignore')
        git('commit', '-m', 'Synthetic source')
        cls.sha = git('rev-parse', 'HEAD')
        subprocess.run(['git', 'init', '--bare', '/fixture-origin.git'], check=True, capture_output=True)
        git('remote', 'add', 'origin', '/fixture-origin.git')
        git('push', 'origin', 'main')
        cls.previous = RELEASES / ('0' * 40 + '.oldref')
        cls.previous.mkdir()
        (cls.previous / 'docker-compose.yml').write_text(json.dumps(cls.config))

    def setUp(self):
        (ROOT / '.env').write_text('synthetic-environment')
        STATE.write_text(json.dumps({'mode': '', 'commands': [], 'tags': {},
            'image': 'sha256:' + 'a' * 64, 'revision': '0' * 40,
            'release': str(self.previous), 'migrated': False, 'rolled_back': False}))

    def state(self):
        return json.loads(STATE.read_text())

    def mode(self, value):
        state = self.state(); state['mode'] = value; STATE.write_text(json.dumps(state))

    def attempt(self):
        return Path(tempfile.mkdtemp(prefix=self.sha + '.', dir=RELEASES))

    def call(self, phase, release):
        return subprocess.run(['/bin/bash', SCRIPT, phase, self.sha, str(release)],
                              input='untrusted caller stdin', text=True, capture_output=True, env=self.env, timeout=40)

    def test_success_and_same_sha_retry_preserve_distinct_backups(self):
        first = self.attempt()
        self.assertEqual(self.call('prepare', first).returncode, 0)
        backup = BACKUPS / first.name
        original = (backup / 'database.dump').read_bytes()
        self.assertTrue(self.state()['archive_list_checked'])
        self.assertFalse((first / '.git').exists())
        self.assertFalse((first / '.env').exists())
        self.assertEqual((first / 'docker-compose.yml').stat().st_mode & 0o022, 0)
        self.assertEqual(self.call('cutover', first).returncode, 0)
        self.assertTrue(self.state()['migration_stdin_closed'])
        second = self.attempt()
        result = self.call('prepare', second)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertNotEqual(first, second)
        self.assertEqual((backup / 'database.dump').read_bytes(), original)
        self.assertTrue((BACKUPS / second.name / 'database.dump').exists())

    def test_config_drift_rejected_before_backup_build_or_migration(self):
        self.mode('config-drift'); release = self.attempt()
        self.assertNotEqual(self.call('prepare', release).returncode, 0)
        self.assertFalse((BACKUPS / release.name).exists())
        self.assertFalse(self.state()['migrated'])

    def test_build_failure_keeps_current_image_and_backup(self):
        self.mode('build-failure'); release = self.attempt()
        self.assertNotEqual(self.call('prepare', release).returncode, 0)
        self.assertTrue((BACKUPS / release.name / 'database.dump').exists())
        self.assertEqual(self.state()['image'], 'sha256:' + 'a' * 64)
        self.assertFalse(self.state()['migrated'])

    def test_migration_failure_does_not_cut_over_or_restore_database(self):
        release = self.attempt()
        self.assertEqual(self.call('prepare', release).returncode, 0)
        self.mode('migration-failure')
        self.assertNotEqual(self.call('cutover', release).returncode, 0)
        self.assertEqual(self.state()['image'], 'sha256:' + 'a' * 64)
        self.assertFalse(self.state()['rolled_back'])

    def test_health_or_revision_failure_rolls_back_image_and_retains_migration(self):
        for mode in ['health-failure', 'revision-failure']:
            with self.subTest(mode=mode):
                self.setUp(); release = self.attempt()
                self.assertEqual(self.call('prepare', release).returncode, 0)
                self.mode(mode)
                self.assertNotEqual(self.call('cutover', release).returncode, 0)
                self.assertEqual(self.state()['image'], 'sha256:' + 'a' * 64)
                self.assertTrue(self.state()['rolled_back'])
                self.assertTrue(self.state()['migrated'])

    def test_environment_change_blocks_migration(self):
        release = self.attempt()
        self.assertEqual(self.call('prepare', release).returncode, 0)
        (ROOT / '.env').write_text('changed')
        self.assertNotEqual(self.call('cutover', release).returncode, 0)
        self.assertFalse(self.state()['migrated'])


if __name__ == '__main__':
    unittest.main()
