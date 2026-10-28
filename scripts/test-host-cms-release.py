import contextlib
import importlib.util
import io
import json
from pathlib import Path
import signal
import subprocess
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import Mock, patch

spec = importlib.util.spec_from_file_location('release', Path(__file__).with_name('host-cms-release.py'))
release = importlib.util.module_from_spec(spec)
spec.loader.exec_module(release)
SHA = 'a' * 40


class BoundaryTests(unittest.TestCase):
    def test_typed_bounded_unique_data(self):
        good = {'operation': 'deploy', 'sha': SHA, 'github_token': 'synthetic'}
        for value in [good, {'operation': 'preflight'}]:
            self.assertEqual(release.request(io.BytesIO(json.dumps(value).encode())), value)
        for value in [[], {**good, 'sha': '../main'}, {**good, 'sha': SHA + '\n'},
                      {**good, 'github_token': 'x\ny'}, {**good, 'command': 'id'},
                      {'operation': 'preflight', 'sha': SHA}]:
            with self.assertRaises(ValueError):
                release.request(io.BytesIO(json.dumps(value).encode()))
        for raw in [b'{"operation":"preflight","operation":"deploy"}', b'x' * 8193]:
            with self.assertRaises(ValueError):
                release.request(io.BytesIO(raw))

    def test_latest_exact_main_push_security_workflow_required(self):
        run = dict(id=1, run_attempt=1, head_sha=SHA, head_branch='main', event='push',
                   path='.github/workflows/security.yml', status='completed', conclusion='success')
        def verify(runs, main=SHA, count=None):
            def fetch(path, token):
                if path == '/branches/main':
                    return {'commit': {'sha': main}}
                return {'total_count': len(runs) if count is None else count, 'workflow_runs': runs}
            release.verify_release(SHA, 'synthetic', fetch)
        verify([run])
        for changes in [{'head_sha': 'b' * 40}, {'head_branch': 'other'}, {'event': 'pull_request'},
                        {'path': '.github/workflows/unrelated.yml'}, {'status': 'in_progress'},
                        {'conclusion': 'failure'}]:
            with self.assertRaises(ValueError):
                verify([{**run, **changes}])
        for runs in [[], [run, {**run, 'id': 2, 'conclusion': 'failure'}],
                     [run, {**run, 'run_attempt': 2, 'status': 'in_progress'}]]:
            with self.assertRaises(ValueError):
                verify(runs)
        with self.assertRaises(ValueError):
            verify([run], main='b' * 40)
        with self.assertRaises(ValueError):
            verify([run], count=101)

    def test_token_redirect_is_rejected(self):
        self.assertIsNone(release.NoRedirect().redirect_request(None, None, 302, '', {}, 'https://invalid.example'))

    @contextlib.contextmanager
    def invocation(self, command='deploy', verify=None, execute=None):
        data = {'operation': 'deploy', 'sha': SHA, 'github_token': 'synthetic'}
        with tempfile.TemporaryDirectory() as directory, tempfile.TemporaryFile() as lock:
            root = Path(directory)
            (root / '.env').write_text('synthetic')
            with patch.object(release.sys, 'argv', ['handler']), \
                 patch.object(release.sys, 'stdin', SimpleNamespace(buffer=io.BytesIO(json.dumps(data).encode()))), \
                 patch.object(release.os, 'geteuid', return_value=0), patch.object(release.os, 'umask'), \
                 patch.object(release.signal, 'signal'), patch.object(release.signal, 'alarm'), \
                 patch.dict(release.os.environ, {'SSH_ORIGINAL_COMMAND': command, 'BASH_ENV': 'evil', 'HTTPS_PROXY': 'evil'}, clear=True), \
                 patch.object(release, 'ROOT', root), patch.object(release, 'RELEASES', root), \
                 patch.object(release, 'BACKUPS', root), patch.object(release, 'protected'), \
                 patch('builtins.open', return_value=lock), \
                 patch.object(release, 'verify_release', side_effect=verify), \
                 patch.object(release, 'run', side_effect=execute) as run, \
                 contextlib.redirect_stdout(io.StringIO()):
                yield root, run

    def test_dispatch_rechecks_before_migration_and_drops_caller_environment(self):
        events = []
        with self.invocation(verify=lambda *a: events.append('verify'),
                             execute=lambda args: events.append(args[2])):
            release.main()
            self.assertEqual(dict(release.os.environ), release.ENV)
        self.assertEqual(events, ['verify', 'prepare', 'verify', 'cutover'])

    def test_stale_main_or_environment_change_blocks_cutover(self):
        with self.invocation(verify=[None, ValueError('stale')]) as (root, run):
            with self.assertRaises(ValueError):
                release.main()
            self.assertEqual(run.call_count, 1)
        with self.invocation() as (root, run):
            run.side_effect = lambda args: (root / '.env').write_text('changed')
            with self.assertRaises(ValueError):
                release.main()
            self.assertEqual(run.call_count, 1)

    def test_command_mismatch_and_lock_contention_never_execute(self):
        for command in ['', 'bash -s', 'internal-sftp', 'deploy; id']:
            with self.invocation(command=command) as (root, run):
                with self.assertRaises(ValueError):
                    release.main()
                run.assert_not_called()
        with self.invocation() as (root, run), patch.object(release.fcntl, 'flock', side_effect=BlockingIOError):
            with self.assertRaises(BlockingIOError):
                release.main()
            run.assert_not_called()

    def test_privileged_children_use_fixed_environment_and_closed_stdin(self):
        child = Mock()
        child.wait.return_value = 0
        with patch.object(release.subprocess, 'Popen', return_value=child) as popen:
            release.run(['/bin/bash', str(release.SCRIPT), 'prepare', SHA, '/trusted/release'])
        self.assertEqual(popen.call_args.kwargs, dict(env=release.ENV, stdin=subprocess.DEVNULL, start_new_session=True))

    def test_timeout_or_disconnect_terminates_privileged_process_group(self):
        for error in [subprocess.TimeoutExpired('fixture', 1200), RuntimeError('disconnect')]:
            child = Mock(pid=4321)
            child.wait.side_effect = [error, 1]
            with patch.object(release.subprocess, 'Popen', return_value=child), \
                 patch.object(release.os, 'killpg') as kill:
                with self.assertRaises(type(error)):
                    release.run(['/bin/bash', 'fixture'])
                kill.assert_called_once_with(4321, signal.SIGTERM)

    def test_protected_ownership_modes_and_symlinks(self):
        with patch.object(Path, 'lstat', return_value=SimpleNamespace(st_uid=0, st_mode=0o100644)):
            release.protected(Path('/trusted/script'))
        for uid, mode in [(1, 0o100644), (0, 0o100666), (0, 0o120777)]:
            with patch.object(Path, 'lstat', return_value=SimpleNamespace(st_uid=uid, st_mode=mode)):
                with self.assertRaises(ValueError):
                    release.protected(Path('/untrusted/script'))


if __name__ == '__main__':
    unittest.main()
