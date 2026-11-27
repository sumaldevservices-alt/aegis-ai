"""First-run ``aegis setup`` after an agent import: a model the import brought is offered first and
kept by default, instead of being replaced by a sign-in step."""

from argparse import Namespace
from unittest.mock import patch

import pytest


def _fake_import(_aegis_home):
    """What an agent import leaves behind: a model in config.yaml and its key in .env."""
    from aegis_cli.config import load_config, save_config, save_env_value
    config = load_config()
    config["model"] = {"provider": "openrouter", "default": "anthropic/claude-sonnet-4.5"}
    save_config(config)
    save_env_value("OPENROUTER_API_KEY", "sk-or-demo-not-a-real-key")
    return "OpenClaw"


def _fake_nous_flow(config):
    """The real flow logs in and saves provider ``nous`` with a Portal model."""
    from aegis_cli.config import save_config
    config["model"] = {"provider": "nous", "default": "Aegis-4-405B"}
    save_config(config)


@pytest.mark.parametrize("pick_portal, nous_runs, expected_model", [
    (False, 0, {"provider": "openrouter", "default": "anthropic/claude-sonnet-4.5"}),
    (True, 1, {"provider": "nous", "default": "Aegis-4-405B"}),
])
def test_first_run_keeps_imported_model_unless_user_picks_another(pick_portal, nous_runs, expected_model):
    from aegis_cli.config import get_env_value, load_config
    from aegis_cli.setup import run_setup_wizard

    menus = []

    def answer(question, choices, default=0, description=None):
        menus.append((question, list(choices)))
        if pick_portal:
            return next(i for i, c in enumerate(choices) if c.startswith("Sign in to Nous Portal"))
        return default

    with patch("aegis_cli.setup.is_interactive_stdin", return_value=True), \
            patch("aegis_cli.setup.offer_agent_import", side_effect=_fake_import), \
            patch("aegis_cli.setup.prompt_choice", side_effect=answer), \
            patch("aegis_cli.model_setup_flows._model_flow_nous", side_effect=_fake_nous_flow) as nous, \
            patch("aegis_cli.setup.setup_terminal_backend") as terminal, \
            patch("aegis_cli.setup.setup_gateway") as gateway, \
            patch("aegis_cli.setup._record_setup_completed"):
        run_setup_wizard(Namespace(non_interactive=False, section=None, reset=False,
                                   reconfigure=False, quick=False))

    assert nous.call_count == nous_runs
    model = load_config()["model"]
    assert {k: model.get(k) for k in expected_model} == expected_model
    assert get_env_value("OPENROUTER_API_KEY") == "sk-or-demo-not-a-real-key"
    # One question: the first row keeps the import; no terminal or messaging screens follow.
    assert len(menus) == 1 and menus[0][0] == "How do you want to power Aegis?"
    assert menus[0][1][0] == "Keep my imported model (OpenRouter · anthropic/claude-sonnet-4.5)"
    terminal.assert_not_called()
    gateway.assert_not_called()
