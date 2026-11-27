"""Resolve AEGIS_HOME for standalone skill scripts.

Skill scripts may run outside the Aegis process (system Python, nix env,
CI) where ``aegis_constants`` is not importable.  This module provides the
same ``get_aegis_home()`` contract without requiring it on ``sys.path``.

When ``aegis_constants`` IS available it is used directly so profile
resolution and any future enhancements are picked up automatically.
"""

from __future__ import annotations

import os
from pathlib import Path

try:
    from aegis_constants import get_aegis_home
except (ModuleNotFoundError, ImportError):

    def get_aegis_home() -> Path:
        """Return the Aegis home directory (default: ``~/.aegis``)."""
        val = os.environ.get("AEGIS_HOME", "").strip()
        return Path(val) if val else Path.home() / ".aegis"
