import pytest
from aegis.core.safety import safety_engine, RiskLevel
from aegis.core.vault import Vault
from aegis.tools.system import get_system_stats
from aegis.tools.shell import run_shell
from aegis.persistence.db import db

def test_safety_engine():
    assert safety_engine.classify_command("ls -la") == RiskLevel.READ
    assert safety_engine.classify_command("systemctl restart nginx") == RiskLevel.MEDIUM
    assert safety_engine.classify_command("rm -rf /") == RiskLevel.HIGH

def test_system_stats():
    stats = get_system_stats()
    assert "cpu_percent" in stats
    assert "memory" in stats
    assert "disk" in stats

def test_shell_tool_and_db():
    res = run_shell("echo 'hello aegis'")
    assert res["success"] is True
    assert "hello aegis" in res["stdout"]

    # Blocked high risk
    res_high = run_shell("rm -rf /")
    assert res_high["success"] is False
    assert res_high["risk"] == "HIGH"

    logs = db.get_logs(limit=5)
    assert len(logs) > 0

def test_vault():
    vault = Vault(key_path="~/.aegis/test_vault.key", store_path="~/.aegis/test_vault.enc")
    secret = "my_super_secret"
    enc = vault.encrypt(secret)
    dec = vault.decrypt(enc)
    assert dec == secret
