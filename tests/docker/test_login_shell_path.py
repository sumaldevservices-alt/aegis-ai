"""Login shells in the image keep Aegis' own dirs on PATH.

Debian's ``/etc/profile`` resets PATH for every login shell, so without
``/etc/profile.d/aegis.sh`` a ``bash -l`` (``docker exec <c> bash -l``, ssh, the
terminal tool's background ``bash -lic``) lost ``/opt/aegis/bin`` and bare
``aegis`` exited 127 (#56634).
"""
from __future__ import annotations

import subprocess


def test_login_shell_resolves_aegis_to_the_image_shim(built_image: str) -> None:
    r = subprocess.run(
        ["docker", "run", "--rm", "-u", "aegis", "--entrypoint", "bash", built_image,
         "-lc", 'echo "aegis=$(command -v aegis)"; echo "path=$PATH"'],
        capture_output=True, text=True, timeout=60, check=False,
    )
    assert r.returncode == 0, r.stderr
    lines = dict(line.split("=", 1) for line in r.stdout.splitlines() if "=" in line)
    assert lines["aegis"] == "/opt/aegis/bin/aegis"
    entries = lines["path"].split(":")
    assert entries.index("/opt/aegis/bin") < entries.index("/opt/aegis/.venv/bin")
    assert entries.count("/opt/aegis/bin") == 1
