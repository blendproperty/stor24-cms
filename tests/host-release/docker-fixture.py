#!/usr/bin/python3
"""CLI lifecycle fixture only; it does not implement or access a real database."""
import json
import os
from pathlib import Path
import sys

path = Path('/tmp/cms-lifecycle-state.json')
state = json.loads(path.read_text())
args = sys.argv[1:]
state['commands'].append(args)
code = 0
output = ''
if args[:2] == ['inspect', 'stor24-cms']:
    if '--format' not in args:
        output = json.dumps([{'Config': {'Labels': {
            'com.docker.compose.project.config_files': state['release'] + '/docker-compose.yml',
            'com.docker.compose.project.working_dir': state['release']}}}])
    elif '.Image' in args[-1]:
        output = state['image']
    elif 'org.opencontainers.image.revision' in args[-1]:
        output = state['revision']
    else:
        output = 'stor24-cms'
elif args[:2] == ['image', 'tag']:
    state['tags'][args[3]] = args[2]
elif args[:2] == ['exec', 'stor4_db']:
    assert args[2:] == ['pg_dump', '-U', 'stor4_user', '-d', 'stor4_db', '-Fc']
    output = 'PGDMP-synthetic-cli-fixture'
elif args[:3] == ['exec', '-i', 'stor4_db']:
    assert args[3:] == ['pg_restore', '--list']
    assert sys.stdin.buffer.read().startswith(b'PGDMP-synthetic-cli-fixture')
    state['archive_list_checked'] = True
elif args[:2] == ['exec', 'stor24-cms']:
    assert args[2:4] == ['node', '-e']
    code = int(state['mode'] == 'health-failure')
elif args[0] == 'compose':
    directory = args[args.index('--project-directory') + 1]
    file = args[args.index('-f') + 1]
    operation = args[args.index('-f') + 2]
    if operation == 'config':
        if '--format' in args:
            config = json.loads(Path(file).read_text())
            config['services']['stor24-cms']['build']['context'] = directory
            if state['mode'] == 'config-drift' and directory != state['release']:
                config['services']['stor24-cms']['networks'] = ['unexpected']
            output = json.dumps(config)
    elif operation == 'build':
        code = int(state['mode'] == 'build-failure')
    elif operation == 'run':
        assert args[args.index('-f') + 2:] == ['run', '--rm', '-T', '--no-deps', 'stor24-cms', 'npx', 'payload', 'migrate']
        assert sys.stdin.buffer.read() == b'', 'Migration inherited caller stdin'
        state['migration_stdin_closed'] = True
        code = int(state['mode'] == 'migration-failure')
        if not code:
            state['migrated'] = True
    elif operation == 'up':
        assert args[args.index('-f') + 2:] == ['up', '-d', '--no-build', '--no-deps', 'stor24-cms']
        tag = os.environ['IMAGE_TAG']
        if tag.startswith('rollback-'):
            state['image'] = state['tags']['stor24-cms:' + tag]
            state['rolled_back'] = True
        else:
            state['image'] = 'sha256:' + 'c' * 64
            state['revision'] = 'b' * 40 if state['mode'] == 'revision-failure' else tag
            state['release'] = directory
    else:
        raise AssertionError('Unexpected Compose operation: ' + operation)
else:
    raise AssertionError('Unexpected Docker operation')
path.write_text(json.dumps(state))
if output:
    print(output)
sys.exit(code)
