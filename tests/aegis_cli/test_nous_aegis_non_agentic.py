"""Tests for the Nous-Aegis-3/4 non-agentic warning detector.

Prior to this check, the warning fired on any model whose name contained
``"aegis"`` anywhere (case-insensitive). That false-positived on unrelated
local Modelfiles such as ``aegis-brain:qwen3-14b-ctx16k`` — a tool-capable
Qwen3 wrapper that happens to live under the "aegis" tag namespace.

``is_nous_aegis_non_agentic`` should only match the actual Nous Research
Aegis-3 / Aegis-4 chat family.
"""

from __future__ import annotations

import pytest

from aegis_cli.model_switch import (
    _AEGIS_MODEL_WARNING,
    _check_aegis_model_warning,
    is_nous_aegis_non_agentic,
)


@pytest.mark.parametrize(
    "model_name",
    [
        "NousResearch/Aegis-3-Llama-3.1-70B",
        "NousResearch/Aegis-3-Llama-3.1-405B",
        "aegis-3",
        "Aegis-3",
        "aegis-4",
        "aegis-4-405b",
        "aegis_4_70b",
        "openrouter/aegis3:70b",
        "openrouter/nousresearch/aegis-4-405b",
        "NousResearch/Aegis3",
        "aegis-3.1",
    ],
)
def test_matches_real_nous_aegis_chat_models(model_name: str) -> None:
    assert is_nous_aegis_non_agentic(model_name), (
        f"expected {model_name!r} to be flagged as Nous Aegis 3/4"
    )
    assert _check_aegis_model_warning(model_name) == _AEGIS_MODEL_WARNING


