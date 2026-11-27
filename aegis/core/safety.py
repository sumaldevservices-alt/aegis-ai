"""AEGIS Safety Engine & Policy Enforcement."""

import re
from enum import Enum
from typing import Dict, Any

class RiskLevel(str, Enum):
    READ = "READ"
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"

HIGH_RISK_PATTERNS = [
    r"rm\s+-rf\s+/(?:\s|$)",
    r"mkfs\.",
    r"dd\s+if=",
    r">\s*/dev/sd[a-z]",
    r"iptables\s+-F",
    r"drop\s+database",
    r"fdisk",
    r"shutdown",
    r"reboot",
    r"systemctl\s+stop\s+(?:ssh|sshd|networking|firewalld|ufw)",
    r":\s*\(\)\s*\{\s*:\s*\|\s*:\s*&\s*\}\s*;\s*:", # fork bomb
    r"chmod\s+-R\s+777\s+/",
]

MEDIUM_RISK_PATTERNS = [
    r"apt-get\s+install",
    r"pip\s+install",
    r"systemctl\s+(?:restart|stop|start)\s+",
    r"ufw\s+allow",
    r"chmod\s+777",
    r"chown\s+",
    r"kill\s+",
    r"docker\s+rm",
    r"git\s+push\s+.*--force",
]

class SafetyEngine:
    def classify_command(self, command: str) -> RiskLevel:
        if not command or not isinstance(command, str):
            return RiskLevel.HIGH # Default to deny on invalid/empty
            
        cmd_lower = command.lower().strip()
        
        # Check high risk
        for pattern in HIGH_RISK_PATTERNS:
            if re.search(pattern, cmd_lower, re.IGNORECASE):
                return RiskLevel.HIGH
                
        # Check command chaining or dangerous combinations
        chain_chars = ["&&", "||", ";", "|", "`", "$("]
        has_chain = any(ch in command for ch in chain_chars)
        
        for pattern in MEDIUM_RISK_PATTERNS:
            if re.search(pattern, cmd_lower, re.IGNORECASE):
                return RiskLevel.HIGH if has_chain else RiskLevel.MEDIUM
                
        # Check read-only keywords
        read_keywords = ["ls", "cat", "grep", "ps", "top", "df", "free", "uname", "systemctl status", "journalctl", "git status", "echo"]
        for kw in read_keywords:
            if cmd_lower.startswith(kw):
                return RiskLevel.READ
                
        if has_chain:
            return RiskLevel.MEDIUM
            
        return RiskLevel.LOW

safety_engine = SafetyEngine()
