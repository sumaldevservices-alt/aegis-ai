from __future__ import annotations

import os
from pathlib import Path
import subprocess
import sys


def test_platform_modules_only_import_stdlib_and_aegis_platform() -> None:
    root = Path(__file__).resolve().parents[2]
    code = """
import sys
before = set(sys.modules)
import aegis_platform.host.facts
import aegis_platform.host.gpu_adapters
import aegis_platform.host.runtime
import aegis_platform.host.products
import aegis_platform.host.summary
import aegis_platform.declaration
import aegis_platform.resolver
import aegis_platform.resolver.app
import aegis_platform.resolver.availability
import aegis_platform.resolver.known_dirs
new_top_levels = {name.partition('.')[0] for name in set(sys.modules) - before}
unexpected = sorted(
    name
    for name in new_top_levels
    if name not in sys.stdlib_module_names and not name.startswith('aegis_platform')
)
assert not unexpected, unexpected
"""
    env = os.environ.copy()
    env["PYTHONPATH"] = "."

    subprocess.run(
        [sys.executable, "-c", code],
        cwd=root,
        env=env,
        check=True,
    )
