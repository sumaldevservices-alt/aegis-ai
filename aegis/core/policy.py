import yaml
from pathlib import Path
from typing import Dict, Any, List
from aegis.core.safety import RiskLevel

class PolicyEngine:
    def __init__(self, policy_path: str = "~/.aegis/policy.yaml"):
        self.policy_path = Path(policy_path).expanduser()
        self._load_policy()

    def _load_policy(self):
        if self.policy_path.exists():
            with open(self.policy_path, "r") as f:
                self.policy = yaml.safe_load(f) or {}
        else:
            self.policy = {
                "autonomy_level": 2,
                "require_approval_for": ["HIGH", "MEDIUM"],
                "blocklist": ["rm -rf /", "mkfs", "dd if="]
            }

    def requires_approval(self, risk: RiskLevel) -> bool:
        require_list = self.policy.get("require_approval_for", ["HIGH", "MEDIUM"])
        return risk.value in require_list

policy_engine = PolicyEngine()
