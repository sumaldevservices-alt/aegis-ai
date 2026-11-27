"""Resolve AEGIS_HOME for standalone skill scripts.

Skill scripts may run outside the Aegis process (e.g. system Python,
nix env, CI) where ``aegis_constants`` is not importable.  This module
provides the same ``get_aegis_home()`` and ``display_aegis_home()``
contracts as ``aegis_constants`` without requiring it on ``sys.path``.

When ``aegis_constants`` IS available it is used directly so that any
future enhancements (profile resolution, Docker detection, etc.) are
picked up automatically.  The fallback path replicates the core logic
from ``aegis_constants.py`` using only the stdlib.

All scripts under ``google-workspace/scripts/`` should import from here
instead of duplicating the ``AEGIS_HOME = Path(os.getenv(...))`` pattern.
"""

from __future__ import annotations

import os
from pathlib import Path

try:
    from aegis_constants import display_aegis_home
    from aegis_constants import get_aegis_home
except (ModuleNotFoundError, ImportError):

    def get_aegis_home() -> Path:
        """Return the Aegis home directory (default: ~/.aegis).

        Mirrors ``aegis_constants.get_aegis_home()``."""
        val = os.environ.get("AEGIS_HOME", "").strip()
        return Path(val) if val else Path.home() / ".aegis"

    def display_aegis_home() -> str:
        """Return a user-friendly ``~/``-shortened display string.

        Mirrors ``aegis_constants.display_aegis_home()``."""
        home = get_aegis_home()
        try:
            return "~/" + home.relative_to(Path.home()).as_posix()
        except ValueError:
            return str(home)
