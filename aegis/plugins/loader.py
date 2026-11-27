"""AEGIS Plugin System & Sandbox Loader."""

import os
from pathlib import Path
from typing import Dict, Any, List

class PluginManager:
    def __init__(self, plugins_dir: str = "~/.aegis/plugins"):
        self.plugins_dir = Path(plugins_dir).expanduser()
        self.plugins_dir.mkdir(parents=True, exist_ok=True)

    def list_plugins(self) -> List[str]:
        if not self.plugins_dir.exists():
            return []
        return [p.name for p in self.plugins_dir.iterdir() if p.is_dir()]

plugin_manager = PluginManager()
