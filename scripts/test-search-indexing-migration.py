"""Rehearse only the additive SEO migration in a network-isolated synthetic database."""
import json
from pathlib import Path
import re
import subprocess
import time

name = "stor24-seo-migration-" + str(int(time.time()))


def docker(*args, stdin=None):
    return subprocess.run(["docker", *args], input=stdin, text=True, capture_output=True, check=True).stdout.strip()


sql = re.search(r"db.execute\(sql`([\s\S]*?)`\)", Path("src/migrations/20261031_050000_search_indexing.ts").read_text())[1]
started = False
try:
    docker("run", "--detach", "--name", name, "--label", "codex.task=stor24-seo-migration", "--network", "none", "--memory", "256m", "--tmpfs", "/var/lib/postgresql/data", "-e", "POSTGRES_PASSWORD=synthetic-seo-test-only", "-e", "POSTGRES_DB=seo_migration_ci", "postgres:16-alpine")
    started = True
    for _ in range(30):
        try:
            docker("exec", name, "pg_isready", "-U", "postgres")
            break
        except subprocess.CalledProcessError:
            time.sleep(1)
    def query(statement):
        return docker("exec", "-i", name, "psql", "-U", "postgres", "-d", "seo_migration_ci", "-v", "ON_ERROR_STOP=1", "-At", stdin=statement)
    query("CREATE TABLE posts(id serial primary key,title text); CREATE TABLE storage_insights(id serial primary key,title text); INSERT INTO posts(title) VALUES ('synthetic article'); INSERT INTO storage_insights(title) VALUES ('synthetic guide');")
    query(sql)
    assert query("SELECT no_index FROM posts; SELECT no_index FROM storage_insights;") == "f\nf"
    query("UPDATE posts SET no_index=true; UPDATE storage_insights SET no_index=true;")
    query(sql)
    assert query("SELECT title||':'||no_index FROM posts; SELECT title||':'||no_index FROM storage_insights;") == "synthetic article:true\nsynthetic guide:true"
    query("INSERT INTO posts(title) VALUES ('new article');")
    assert query("SELECT no_index FROM posts WHERE title='new article';") == "f"
    print(json.dumps({"migration": "20261031_050000_search_indexing", "existing_content_preserved": True, "defaults_indexable": True, "replay_preserves_editor_choices": True, "network": "none"}))
finally:
    if started:
        docker("rm", "--force", name)
