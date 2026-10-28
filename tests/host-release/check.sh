#!/bin/bash
set -euo pipefail
mkdir -p /opt/stor24-cms/.git /run/sshd /root/.ssh /opt/stor24-cms-releases /root/stor24-cms-releases
touch /opt/stor24-cms/.git/config /opt/stor24-cms/.env /opt/stor24-cms/docker-compose.yml
chmod 600 /opt/stor24-cms/.env /opt/stor24-cms/docker-compose.yml
ssh-keygen -q -t ed25519 -N '' -f /root/.ssh/fixture
bash /staging/install-host-cms-release.sh /root/.ssh/fixture.pub
ssh-keygen -A
/usr/sbin/sshd -D -e -p 2222 -o ListenAddress=127.0.0.1 -o PasswordAuthentication=no -o KbdInteractiveAuthentication=no > /tmp/sshd.log 2>&1 &
server=$!
trap 'kill "$server"' EXIT
awk '{print "[127.0.0.1]:2222 " $1 " " $2}' /etc/ssh/ssh_host_ed25519_key.pub > /tmp/known_hosts
client=(ssh -p 2222 -i /root/.ssh/fixture -o IdentitiesOnly=yes -o BatchMode=yes -o StrictHostKeyChecking=yes -o UserKnownHostsFile=/tmp/known_hosts -o HostKeyAlgorithms=ssh-ed25519 -o ConnectionAttempts=3 -o ConnectTimeout=2 stor24-cms-deploy@127.0.0.1)
printf '{"operation":"preflight"}\n' | "${client[@]}" preflight > /tmp/ready.json
python3 -c 'import json; j=json.load(open("/tmp/ready.json")); assert j=={"status":"ready","role":"stor24-cms-deploy","deployment_performed":False}'
for command in id 'bash -s' internal-sftp 'preflight; id'; do
  if printf '{"operation":"preflight"}\n' | "${client[@]}" "$command"; then
    echo 'Arbitrary command accepted' >&2; exit 1
  fi
done
if printf '{"operation":"deploy","sha":"../master","github_token":"synthetic"}\n' | "${client[@]}" deploy; then exit 1; fi
if printf '{"operation":"preflight","extra":"bad"}\n' | "${client[@]}" preflight; then exit 1; fi
if printf '{"operation":"preflight"}\n' | "${client[@]}" -tt preflight; then exit 1; fi
if timeout 5 "${client[@]}" -o ExitOnForwardFailure=yes -N -R 127.0.0.1:2223:127.0.0.1:2222; then exit 1; else test "$?" != 124; fi
if sudo -u stor24-cms-deploy sudo -n /bin/sh -c id; then exit 1; fi
if sudo -u stor24-cms-deploy sudo -n /usr/local/sbin/stor24-cms-release extra; then exit 1; fi
for target in /usr/local/sbin/stor24-cms-release /usr/local/lib/stor24-cms-release/release.sh /etc/ssh/stor24-cms-keys/stor24-cms-deploy /opt/stor24-cms /opt/stor24-cms/.env /opt/stor24-cms/docker-compose.yml; do
  if sudo -u stor24-cms-deploy test -w "$target"; then exit 1; fi
done
echo 'PASS: isolated SSH preflight, command/PTY/forwarding rejection, exact sudo argv, protected files'
