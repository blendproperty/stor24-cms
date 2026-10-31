"""Rehearse additive editor tables, constraints and replay without production data/network."""
import json
from pathlib import Path
import re
import subprocess
import time
import uuid

name = "stor24-editor-seo-" + uuid.uuid4().hex[:12]
def docker(*args, stdin=None):
    return subprocess.run(["docker", *args], input=stdin, text=True, capture_output=True, check=True).stdout.strip()
sql = re.search(r"db.execute\(sql`([\s\S]*?)`\)", Path("src/migrations/20261031_071213_editor_seo_controls.ts").read_text())[1]
started = False
try:
    docker("run", "--detach", "--name", name, "--label", "codex.task=stor24-editor-seo-migration", "--network", "none", "--memory", "256m", "--tmpfs", "/var/lib/postgresql/data", "-e", "POSTGRES_PASSWORD=synthetic-editor-test-only", "-e", "POSTGRES_DB=editor_seo_ci", "postgres:16-alpine")
    started = True
    for _ in range(30):
        # The entrypoint briefly accepts Unix-socket connections before creating
        # the requested database and restarting. TCP is enabled only afterwards.
        try: docker("exec", name, "pg_isready", "-h", "127.0.0.1", "-U", "postgres", "-d", "editor_seo_ci"); break
        except subprocess.CalledProcessError: time.sleep(1)
    else: raise RuntimeError("Disposable PostgreSQL did not finish initialization")
    def query(statement):
        return docker("exec", "-i", name, "psql", "-U", "postgres", "-d", "editor_seo_ci", "-v", "ON_ERROR_STOP=1", "-At", stdin=statement)
    query("CREATE TABLE media(id integer PRIMARY KEY); CREATE TABLE posts(id serial PRIMARY KEY,title text); CREATE TABLE storage_insights(id serial PRIMARY KEY,title text); CREATE TABLE payload_locked_documents_rels(id serial PRIMARY KEY,posts_id integer); INSERT INTO media VALUES(1); INSERT INTO posts(title) VALUES('existing article'); INSERT INTO storage_insights(title) VALUES('existing guide'); INSERT INTO payload_locked_documents_rels(posts_id) VALUES(1);")
    query(sql)
    query("INSERT INTO page_seo(path,seo_title,social_image_id) VALUES('/personal-storage','Saved title',1); INSERT INTO redirects(source,destination) VALUES('/retired-storage','/storage/midpoint');")
    assert query("SELECT no_index||':'||status FROM page_seo; SELECT status_code||':'||status FROM redirects;") == "false:draft\n308:draft"
    query("UPDATE page_seo SET no_index=true,status='published'; UPDATE redirects SET status='published'; INSERT INTO payload_locked_documents_rels(page_seo_id) VALUES(1); INSERT INTO payload_locked_documents_rels(redirects_id) VALUES(1);")
    query(sql)
    assert query("SELECT seo_title||':'||no_index FROM page_seo;") == "Saved title:true"
    assert query("SELECT source||'>'||destination FROM redirects;") == "/retired-storage>/storage/midpoint"
    assert query("SELECT title FROM posts; SELECT title FROM storage_insights; SELECT count(*) FROM payload_locked_documents_rels;") == "existing article\nexisting guide\n3"
    for bad in ["INSERT INTO page_seo(path) VALUES('/personal-storage');", "INSERT INTO redirects(source,destination,status_code) VALUES('/bad-code','/',200);", "INSERT INTO redirects(source,destination) VALUES('/self','/self');", "UPDATE page_seo SET canonical_path='/business-storage';"]:
        try: query(bad)
        except subprocess.CalledProcessError: pass
        else: raise AssertionError("Database constraint accepted invalid SEO configuration")
    query("DELETE FROM media WHERE id=1;")
    assert query("SELECT social_image_id IS NULL FROM page_seo;") == "t"
    print(json.dumps({"migration":"20261031_071213_editor_seo_controls","additive":True,"existing_content_and_locks_preserved":True,"editor_values_survive_replay":True,"constraints_and_media_relation":True,"network":"none"}))
finally:
    if started: docker("rm", "--force", name)
