"""execute_code child env honors the multiplexed per-turn AEGIS_HOME override (#110303).

Under a multiplexed Desktop/Dashboard connection one server process serves several
profiles, binding a context-local AEGIS_HOME override per turn. ``_build_child_env``
scrubs the server process's ``os.environ`` — which carries the machine-default
AEGIS_HOME — so without the rewrite below, skill scripts run via ``execute_code``
silently read/write the wrong profile's directory.
"""

import sys

import pytest

from aegis_constants import (
    get_aegis_home_override,
    reset_aegis_home_override,
    set_aegis_home_override,
)
from tools.code_execution_env import _build_child_env


@pytest.fixture
def home_override():
    tokens = []

    def _set(path):
        tokens.append(set_aegis_home_override(path))
        return str(path)

    yield _set
    for token in reversed(tokens):
        reset_aegis_home_override(token)


def _child_env():
    return _build_child_env(
        rpc_endpoint="sock",
        rpc_token="tok",
        tmpdir="/tmp/aegis-test",
        child_python=sys.executable,
    )


class TestMultiplexedAegisHome:
    def test_override_rewrites_stale_server_default_per_turn(self, monkeypatch, home_override, tmp_path):
        """The reported bug: a child must see the ACTIVE profile's home, not the server default,
        and sequential turns for different profiles each see their own."""
        monkeypatch.setenv("AEGIS_HOME", "/machine/default/.aegis")
        alpha = home_override(tmp_path / "profiles" / "alpha")
        assert _child_env()["AEGIS_HOME"] == alpha
        beta = home_override(tmp_path / "profiles" / "beta")
        assert _child_env()["AEGIS_HOME"] == beta

    def test_no_override_leaves_inherited_value_untouched(self, monkeypatch):
        """Dedicated per-profile processes (no override): zero behavior change."""
        assert get_aegis_home_override() is None
        monkeypatch.setenv("AEGIS_HOME", "/machine/default/.aegis")

        assert _child_env()["AEGIS_HOME"] == "/machine/default/.aegis"
