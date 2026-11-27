import pytest
from fastapi.testclient import TestClient
from aegis.core.safety import safety_engine, RiskLevel
from aegis.core.vault import Vault
from aegis.tools.system import get_system_stats
from aegis.tools.shell import run_shell
from aegis.persistence.db import db
from aegis.tools.browser import browser_tool
from aegis.memory.store import memory_store
from aegis.fleet.runner import fleet_runner
from aegis.api.main import app

client = TestClient(app)

def test_safety_engine():
    assert safety_engine.classify_command("ls -la") == RiskLevel.READ
    assert safety_engine.classify_command("systemctl restart nginx") == RiskLevel.MEDIUM
    assert safety_engine.classify_command("rm -rf /") == RiskLevel.HIGH
    assert safety_engine.classify_command("apt-get install curl && rm -rf /") == RiskLevel.HIGH

def test_system_stats():
    stats = get_system_stats()
    assert "cpu_percent" in stats
    assert "memory" in stats
    assert "disk" in stats

def test_shell_tool_and_db():
    res = run_shell("echo 'hello aegis'")
    assert res["success"] is True
    assert "hello aegis" in res["stdout"]

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

@pytest.mark.asyncio
async def test_browser_ssrf_protection():
    # Test blocked internal IPs and localhost
    blocked_urls = [
        "http://localhost/admin",
        "http://127.0.0.1/",
        "http://169.254.169.254/latest/meta-data/",
        "http://10.0.0.1/",
        "http://192.168.1.1/"
    ]
    for url in blocked_urls:
        res = await browser_tool.fetch_page(url)
        assert res["success"] is False
        assert "Blocked" in res["error"] or "internal" in res["error"] or "private" in res["error"]

def test_memory_fts5():
    memory_store.add_fact("sysadmin", "Nginx service configured with SSL and HTTP/2")
    results = memory_store.search_facts("Nginx")
    assert len(results) > 0
    assert any("Nginx" in r["content"] for r in results)

def test_fleet_runner():
    res = fleet_runner.run_on_fleet("echo 'fleet test'")
    assert "localhost" in res
    assert res["localhost"]["success"] is True
    assert "fleet test" in res["localhost"]["stdout"]

def test_api_auth_and_rbac():
    # Login as admin
    response = client.post("/auth/login", json={"username": "admin", "password": "adminpassword"})
    assert response.status_code == 200
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Status endpoint (viewer+ role)
    status_res = client.get("/status", headers=headers)
    assert status_res.status_code == 200

    # Run endpoint (admin+ role)
    run_res = client.post("/run", json={"command": "echo 'api test'"}, headers=headers)
    assert run_res.status_code == 200
    assert run_res.json()["success"] is True

    # Login as viewer
    viewer_resp = client.post("/auth/login", json={"username": "viewer", "password": "viewerpassword"})
    viewer_token = viewer_resp.json()["access_token"]
    viewer_headers = {"Authorization": f"Bearer {viewer_token}"}

    # Viewer cannot run shell commands (requires admin)
    forbidden_res = client.post("/run", json={"command": "echo 'fail'"}, headers=viewer_headers)
    assert forbidden_res.status_code == 403
