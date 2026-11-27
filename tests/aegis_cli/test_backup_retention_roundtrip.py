"""Tests for aegis backup retention (--keep) and the session-store import round trip."""

from argparse import Namespace
from pathlib import Path

import pytest

import aegis_cli.gateway_setup_service as service_setup
from tests.aegis_cli.test_backup import _make_aegis_tree


@pytest.fixture(autouse=True)
def _no_real_gateway_service(monkeypatch):
    """run_import() may start an existing gateway service post-restore; tests must
    never touch the host's systemd/launchd."""
    import aegis_cli.gateway as gateway_mod

    monkeypatch.setattr(service_setup, "ensure_gateway_service", lambda **kw: False)
    monkeypatch.setattr(gateway_mod, "_is_service_running", lambda: False)


def test_run_backup_prunes_older_default_named_zips_but_not_others(tmp_path, monkeypatch):
    """Hourly `aegis backup` callers accumulated 150+ zips; --keep bounds the default-named
    ones and leaves custom-named or foreign zips alone (#81317)."""
    from argparse import Namespace
    from aegis_cli import backup as backup_mod

    home = tmp_path / ".aegis"
    home.mkdir()
    (home / "config.yaml").write_text("model: x\n")
    monkeypatch.setenv("AEGIS_HOME", str(home))
    monkeypatch.setattr(Path, "home", lambda: tmp_path)
    for i in range(4):
        (tmp_path / f"aegis-backup-2026-01-0{i + 1}-000000.zip").write_bytes(b"old")
    (tmp_path / "my-archive.zip").write_bytes(b"mine")

    backup_mod.run_backup(Namespace(output=None, keep=2))

    kept = sorted(p.name for p in tmp_path.glob("aegis-backup-*.zip"))
    assert len(kept) == 2 and kept[0] == "aegis-backup-2026-01-04-000000.zip"
    assert (tmp_path / "my-archive.zip").exists()


def test_import_restores_the_session_store_with_its_message_uids(tmp_path, monkeypatch):
    """A backup ships state.db as a SQLite snapshot and an import puts it back byte-for-byte: the durable
    message ids come back with the rows."""
    from persistence_assembly import open_persistence, profile_scope
    from tests.fixtures.storage_read import conversation
    from tests.fixtures.storage_seed import seed_messages, seed_session

    aegis_home = tmp_path / ".aegis"
    aegis_home.mkdir()
    _make_aegis_tree(aegis_home)
    with open_persistence(profile_scope(home=aegis_home)) as store:
        seed_session(store, "s", "cli", model="m")
        seed_messages(store, "s", {"role": "user", "content": "q"}, {"role": "assistant", "content": "a"})
        uids = [m["message_uid"] for m in conversation(store, "s")]
    assert len(uids) == 2 and all(len(u) == 32 for u in uids)

    monkeypatch.setenv("AEGIS_HOME", str(aegis_home))
    monkeypatch.setattr(Path, "home", lambda: tmp_path)
    from aegis_cli.backup import run_backup, run_import

    out_zip = tmp_path / "backup.zip"
    run_backup(Namespace(output=str(out_zip)))
    for name in ("state.db", "state.db-wal", "state.db-shm"):
        (aegis_home / name).unlink(missing_ok=True)
    assert run_import(Namespace(zipfile=str(out_zip), force=True)) is None

    with open_persistence(profile_scope(home=aegis_home)) as restored:
        assert [m["message_uid"] for m in conversation(restored, "s")] == uids
