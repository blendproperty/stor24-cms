#!/bin/bash
set -euo pipefail
umask 077
test "$#" = 3
phase="$1"; sha="$2"; release="$3"
[[ "$sha" =~ ^[a-f0-9]{40}$ ]]
[[ "$release" =~ ^/opt/stor24-cms-releases/$sha\.[a-zA-Z0-9_-]{8}$ ]]
test -d "$release" && test ! -L "$release"
cd /opt/stor24-cms
compose=(docker compose -p stor24-cms --project-directory "$release" --env-file /opt/stor24-cms/.env -f "$release/docker-compose.yml")
backup="/root/stor24-cms-releases/${release##*/}"
rollback_tag="rollback-${release##*/}"
export IMAGE_TAG="$sha"
case "$phase" in
  prepare)
    git fetch origin "$sha"
    test "$(git rev-parse FETCH_HEAD)" = "$sha"
    test -z "$(ls -A "$release")"
    git archive "$sha" | tar --no-same-permissions -x -C "$release"
    git show "$sha:package.json" | cmp - "$release/package.json"
    test ! -e "$release/.git" && test ! -e "$release/.env"
    test "$(docker inspect stor24-cms --format '{{index .Config.Labels "com.docker.compose.project"}}')" = stor24-cms
    # Reject routing, mount, network, environment or other Compose drift before Docker writes.
    python3 -I - "$release" <<'PY'
import json, os, pathlib, stat, subprocess, sys
release = pathlib.Path(sys.argv[1])
container = json.loads(subprocess.check_output(['docker', 'inspect', 'stor24-cms']))[0]
labels = container['Config']['Labels']
previous = pathlib.Path(labels['com.docker.compose.project.config_files'])
working = pathlib.Path(labels['com.docker.compose.project.working_dir'])
if previous.name != 'docker-compose.yml' or previous.parent != working or working.parent != release.parent:
    raise ValueError('Previous immutable release is not recognized')
for path in [previous, *previous.parents]:
    info = path.lstat()
    if stat.S_ISLNK(info.st_mode) or info.st_uid != 0 or info.st_mode & 0o022:
        raise ValueError('Previous Compose dependency is not protected')
def effective(directory, file):
    env = dict(os.environ, IMAGE_TAG='contract-validation')
    result = json.loads(subprocess.check_output(['docker', 'compose', '-p', 'stor24-cms', '--project-directory', str(directory), '--env-file', '/opt/stor24-cms/.env', '-f', str(file), 'config', '--format', 'json'], env=env))
    service = result['services']['stor24-cms']
    if service['build']['context'] != str(directory):
        raise ValueError('Unexpected build context')
    service['build']['context'] = 'immutable-release'
    return result
if effective(working, previous) != effective(release, release / 'docker-compose.yml'):
    raise ValueError('CMS Compose changes require a separate administrator review')
PY
    # Each attempt retains its own backup, including retries of the same revision.
    mkdir -m 700 "$backup"
    docker exec stor4_db pg_dump -U stor4_user -d stor4_db -Fc > "$backup/database.dump"
    docker exec -i stor4_db pg_restore --list < "$backup/database.dump" > /dev/null
    cp .env "$backup/runtime.env"
    previous_image="$(docker inspect stor24-cms --format '{{.Image}}')"
    printf '%s\n' "$previous_image" > "$backup/previous-image"
    docker image tag "$previous_image" "stor24-cms:$rollback_tag"
    "${compose[@]}" config --quiet
    "${compose[@]}" build --pull --build-arg RELEASE_SHA="$sha" stor24-cms
    ;;
  cutover)
    test -s "$backup/database.dump" && test -s "$backup/previous-image"
    cmp .env "$backup/runtime.env"
    previous_image="$(cat "$backup/previous-image")"
    test "$(docker inspect stor24-cms --format '{{.Image}}')" = "$previous_image"
    cutover=0; verified=0
    recover() {
      result=$?
      trap - EXIT HUP INT TERM
      if test "$result" = 0 && test "$verified" != 1; then result=1; fi
      if test "$result" -ne 0 && test "$cutover" = 1; then
        IMAGE_TAG="$rollback_tag" "${compose[@]}" up -d --no-build --no-deps stor24-cms || echo 'CMS image rollback failed; retain backup and inspect host state.' >&2
        echo 'CMS image rollback attempted; migration data retained.' >&2
      fi
      exit "$result"
    }
    trap recover EXIT
    trap 'exit 1' HUP INT TERM
    "${compose[@]}" run --rm -T --no-deps stor24-cms npx payload migrate </dev/null
    cutover=1
    "${compose[@]}" up -d --no-build --no-deps stor24-cms
    for attempt in $(seq 1 45); do
      if docker exec stor24-cms node -e "fetch('http://127.0.0.1:3000/admin/login').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"; then
        test "$(docker inspect stor24-cms --format '{{index .Config.Labels "org.opencontainers.image.revision"}}')" = "$sha"
        verified=1
        echo "CMS deployed: $sha"
        exit 0
      fi
      sleep 2
    done
    echo 'CMS login did not become healthy; retain backup and previous image.' >&2
    exit 1
    ;;
  *) exit 1 ;;
esac
