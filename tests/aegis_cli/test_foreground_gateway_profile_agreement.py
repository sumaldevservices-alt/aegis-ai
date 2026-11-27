"""Container boot and the early profile pre-parse must agree on which profile a foreground
``gateway run --no-supervise`` serves, abbreviations included: boot leaves the sticky standalone
profile's s6 slot down for it, so the command itself must follow that sticky profile."""

import json
import os
import sys
from pathlib import Path

import pytest

from aegis_cli.container_boot import reconcile_profile_gateways


@pytest.mark.parametrize("flag", ["--no-supervise", "--no-supervis"])
def test_sticky_standalone_profile_foreground_run_is_served_once(tmp_path, monkeypatch, flag):
    root = tmp_path / ".aegis"
    solo = root / "profiles" / "solo"
    solo.mkdir(parents=True)
    (solo / "SOUL.md").write_text("x", encoding="utf-8")
    (solo / "config.yaml").write_text("gateway:\n  standalone: true\n", encoding="utf-8")
    (solo / "gateway_state.json").write_text(json.dumps({"desired_state": "running"}), encoding="utf-8")
    (root / "active_profile").write_text("solo", encoding="utf-8")
    for var in ("AEGIS_GATEWAY_NO_SUPERVISE", "AEGIS_SUPERVISED_CHILD", "AEGIS_S6_SUPERVISED_CHILD",
                "INVOCATION_ID", "AEGIS_GATEWAY_EXTERNAL_SUPERVISOR", "AEGIS_GATEWAY_PROFILE_PIN"):
        monkeypatch.delenv(var, raising=False)
    cmd = ["gateway", "run", flag]

    actions = reconcile_profile_gateways(aegis_home=root, scandir=tmp_path / "scan",
                                         container_argv=["/init", "/opt/aegis/docker/main-wrapper.sh", *cmd])
    assert [a.action for a in actions if a.profile == "solo"] == ["registered"]  # boot: the CMD serves solo

    monkeypatch.setattr("aegis_constants._get_platform_default_aegis_home", lambda: root)
    monkeypatch.setattr(Path, "home", lambda: tmp_path)
    monkeypatch.setattr("aegis_cli.service_manager._s6_running", lambda: True)
    monkeypatch.setenv("AEGIS_HOME", str(root))
    monkeypatch.setattr(sys, "argv", ["aegis", *cmd])
    from aegis_cli.main import _apply_profile_override
    _apply_profile_override()

    assert os.environ["AEGIS_HOME"] == str(solo)  # the command really runs solo
