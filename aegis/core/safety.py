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
]

MEDIUM_RISK_PATTERNS = [
    r"apt-get\s+install",
    r"pip\s+install",
    r"systemctl\s+(?:restart|stop|start)\s+",
    r"ufw\s+allow",
    r"chmod\s+777",
    r"chown\s+",
    r"kill\s+",
]

class SafetyEngine:
    def classify_command(self, command: str) -> RiskLevel:
        for pattern in HIGH_RISK_PATTERNS:
            if re.search(pattern, command, re.IGNORECASE):
                return RiskLevel.HIGH
        
        for pattern in MEDIUM_RISK_PATTERNS:
            if re.search(pattern, command, re.IGNORECASE):
                return RiskLevel.MEDIUM
        
        # Check if it looks read-only
        read_keywords = ["ls", "cat", "grep", "ps", "top", "df", "free", "uname", "systemctl status", "journalctl", "git status"]
        for kw in read_keywords:
            if command.strip().startswith(kw):
                return RiskLevel.READ
                
        return RiskLevel.LOW

safety_engine = SafetyEngine()
