#!/bin/bash
# Explicit administrator installation only; this script is never called by CI.
set -euo pipefail
test "$(id -u)" = 0
test "$#" = 1
source_dir="$(cd -- "$(dirname -- "$0")" && pwd)"
test ! -L "$1" && test -f "$1"
test "$(wc -l < "$1")" = 1
grep -Eq '^ssh-ed25519 [A-Za-z0-9+/]+={0,2}( [[:print:]]*)?$' "$1"
ssh-keygen -lf "$1"
! getent passwd stor24-cms-deploy >/dev/null
for path in /usr/local/sbin/stor24-cms-release /usr/local/lib/stor24-cms-release /etc/ssh/stor24-cms-keys /etc/ssh/sshd_config.d/00-stor24-cms-deploy.conf /etc/sudoers.d/stor24-cms-deploy; do
  test ! -e "$path" && test ! -L "$path"
done
for path in "$source_dir" "$source_dir/host-cms-release.py" "$source_dir/host-cms-release.sh" /opt /opt/stor24-cms /opt/stor24-cms/.git /opt/stor24-cms/.git/config /opt/stor24-cms/.env /opt/stor24-cms-releases /root/stor24-cms-releases /root /usr /usr/local /usr/local/sbin /usr/local/lib /etc /etc/ssh /etc/ssh/sshd_config.d /etc/sudoers.d; do
  test ! -L "$path"
  test "$(stat -c %u "$path")" = 0
  test $(( 8#$(stat -c %a "$path") & 8#022 )) = 0
done
install -d -o root -g root -m 755 /usr/local/lib/stor24-cms-release /etc/ssh/stor24-cms-keys
install -o root -g root -m 755 "$source_dir/host-cms-release.py" /usr/local/sbin/stor24-cms-release
install -o root -g root -m 755 "$source_dir/host-cms-release.sh" /usr/local/lib/stor24-cms-release/release.sh
useradd --system --user-group --create-home --home-dir /var/lib/stor24-cms-deploy --shell /bin/sh stor24-cms-deploy
printf 'restrict,command="/usr/bin/sudo -n -- /usr/local/sbin/stor24-cms-release" ' > /etc/ssh/stor24-cms-keys/stor24-cms-deploy
cat -- "$1" >> /etc/ssh/stor24-cms-keys/stor24-cms-deploy
chmod 644 /etc/ssh/stor24-cms-keys/stor24-cms-deploy
cat > /etc/sudoers.d/stor24-cms-deploy <<'SUDO'
Defaults:stor24-cms-deploy env_reset
Defaults:stor24-cms-deploy env_keep="SSH_ORIGINAL_COMMAND"
stor24-cms-deploy ALL=(root) NOPASSWD: /usr/local/sbin/stor24-cms-release ""
SUDO
chmod 440 /etc/sudoers.d/stor24-cms-deploy
visudo -cf /etc/sudoers.d/stor24-cms-deploy
cat > /etc/ssh/sshd_config.d/00-stor24-cms-deploy.conf <<'SSH'
Match User stor24-cms-deploy
    AuthorizedKeysFile /etc/ssh/stor24-cms-keys/%u
    DisableForwarding yes
    PermitTTY no
    PermitUserRC no
Match all
SSH
if ! sshd -t; then
  # Only this newly created drop-in is removed; current access remains unchanged.
  rm -- /etc/ssh/sshd_config.d/00-stor24-cms-deploy.conf
  exit 1
fi
test "$(id -nG stor24-cms-deploy)" = stor24-cms-deploy
systemctl reload ssh
echo 'Restricted CMS identity installed. Verify fresh CI preflight before deployment or root retirement.'
