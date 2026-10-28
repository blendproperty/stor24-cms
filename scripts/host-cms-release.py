#!/usr/bin/python3 -I
"""Fixed, root-owned CMS release boundary for a restricted SSH identity."""
import fcntl
import json
import os
from pathlib import Path
import re
import signal
import stat
import subprocess
import sys
import tempfile
import hashlib
import urllib.request

REPO = "https://api.github.com/repos/blendproperty/stor24-cms"
SCRIPT = Path("/usr/local/lib/stor24-cms-release/release.sh")
ROOT = Path("/opt/stor24-cms")
ENV = {"PATH": "/usr/sbin:/usr/bin:/sbin:/bin", "HOME": "/root", "LANG": "C.UTF-8"}
RELEASES = Path("/opt/stor24-cms-releases")
BACKUPS = Path("/root/stor24-cms-releases")


def request(stream):
    raw = stream.read(8193)
    if len(raw) > 8192:
        raise ValueError("Request too large")
    def unique(pairs):
        result = {}
        for key, value in pairs:
            if key in result:
                raise ValueError("Duplicate field")
            result[key] = value
        return result
    data = json.loads(raw, object_pairs_hook=unique)
    if not isinstance(data, dict):
        raise ValueError("Expected an object")
    operation = data.get("operation")
    if operation == "preflight" and set(data) == {"operation"}:
        return data
    if operation != "deploy" or set(data) != {"operation", "sha", "github_token"}:
        raise ValueError("Unknown operation or fields")
    if not isinstance(data["sha"], str) or not re.fullmatch(r"[a-f0-9]{40}", data["sha"]):
        raise ValueError("Invalid release")
    token = data["github_token"]
    if not isinstance(token, str) or not re.fullmatch(r"[!-~]{1,2048}", token):
        raise ValueError("Invalid credential transport")
    return data


def protected(path):
    for item in [path, *path.parents]:
        info = item.lstat()
        if stat.S_ISLNK(info.st_mode) or info.st_uid != 0 or info.st_mode & 0o022:
            raise ValueError("Unprotected deployment dependency")


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def github(path, token):
    query = urllib.request.Request(REPO + path, headers={
        "Authorization": "Bearer " + token,
        "Accept": "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "STOR24 fixed CMS release",
    })
    with urllib.request.build_opener(NoRedirect).open(query, timeout=15) as response:
        raw = response.read(1048577)
    if len(raw) > 1048576:
        raise ValueError("Release evidence too large")
    return json.loads(raw)


def verify_release(sha, token, fetch=github):
    if fetch("/branches/main", token)["commit"]["sha"] != sha:
        raise ValueError("Release is not current main")
    runs = fetch("/actions/runs?head_sha=" + sha + "&event=push&per_page=100", token)
    if runs["total_count"] > 100:
        raise ValueError("Review excess release evidence")
    matches = [r for r in runs["workflow_runs"] if
               r.get("head_sha") == sha and r.get("head_branch") == "main" and
               r.get("event") == "push" and r.get("path") == ".github/workflows/security.yml"]
    latest = max(matches, key=lambda r: (r["id"], r["run_attempt"]), default=None)
    if not latest or latest.get("status") != "completed" or latest.get("conclusion") != "success":
        raise ValueError("Required exact-main workflow not successful")


def run(args):
    process = subprocess.Popen(args, env=ENV, stdin=subprocess.DEVNULL, start_new_session=True)
    try:
        result = process.wait(timeout=1200)
    except BaseException:
        try:
            os.killpg(process.pid, signal.SIGTERM)
        except ProcessLookupError:
            pass
        try:
            process.wait(timeout=30)
        except subprocess.TimeoutExpired:
            os.killpg(process.pid, signal.SIGKILL)
            process.wait()
        raise
    if result:
        raise subprocess.CalledProcessError(result, args)


def main():
    if len(sys.argv) != 1 or os.geteuid() != 0:
        raise ValueError("Restricted invocation")
    def interrupted(signum, frame):
        raise RuntimeError("Release interrupted")
    for signum in [signal.SIGHUP, signal.SIGTERM, signal.SIGINT]:
        signal.signal(signum, interrupted)
    signal.alarm(15)
    try:
        data = request(sys.stdin.buffer)
    finally:
        signal.alarm(0)
    if os.environ.get("SSH_ORIGINAL_COMMAND") != data["operation"]:
        raise ValueError("Unexpected SSH command")
    os.environ.clear()
    os.environ.update(ENV)
    os.umask(0o077)
    for path in [Path(__file__), SCRIPT, ROOT, ROOT / ".git/config",
                 ROOT / ".env", RELEASES, BACKUPS]:
        protected(path)
    with open("/run/stor24-cms-release.lock", "a") as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        if data["operation"] == "preflight":
            print('{"status":"ready","role":"stor24-cms-deploy","deployment_performed":false}')
            return
        sha, token = data["sha"], data["github_token"]
        verify_release(sha, token)
        environment_hash = hashlib.sha256((ROOT / ".env").read_bytes()).digest()
        release = Path(tempfile.mkdtemp(prefix=sha + ".", dir=RELEASES))
        run(["/bin/bash", str(SCRIPT), "prepare", sha, str(release)])
        # Reject a newer main or changed environment before migrations/cutover.
        verify_release(sha, token)
        if hashlib.sha256((ROOT / ".env").read_bytes()).digest() != environment_hash:
            raise ValueError("Runtime environment changed during preparation")
        protected(release)
        run(["/bin/bash", str(SCRIPT), "cutover", sha, str(release)])
        print(json.dumps({"status": "deployed", "sha": sha}))


if __name__ == "__main__":
    try:
        main()
    except Exception:
        # Requests contain an ephemeral GitHub credential; never print their values.
        print("CMS release rejected or failed; retain current access and inspect host state.", file=sys.stderr)
        sys.exit(1)
