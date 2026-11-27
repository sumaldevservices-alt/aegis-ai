from enum import Enum
from typing import Dict, Any

class TaskComplexity(str, Enum):
    TRIVIAL = "trivial"
    ROUTINE = "routine"
    COMPLEX = "complex"
    CRITICAL = "critical"

class EffortRouter:
    def classify_task(self, prompt: str) -> TaskComplexity:
        prompt_lower = prompt.lower()
        if any(w in prompt_lower for w in ["reboot", "rm", "drop", "migrate", "production", "deploy", "security", "audit"]):
            return TaskComplexity.CRITICAL
        if any(w in prompt_lower for w in ["configure", "setup", "install", "debug", "fix", "optimize"]):
            return TaskComplexity.COMPLEX
        if any(w in prompt_lower for w in ["status", "check", "list", "uptime", "df"]):
            return TaskComplexity.TRIVIAL
        return TaskComplexity.ROUTINE

    def get_effort_config(self, complexity: TaskComplexity) -> Dict[str, Any]:
        if complexity == TaskComplexity.CRITICAL:
            return {"effort": "max", "thinking_budget": 8192, "critic_passes": 2}
        elif complexity == TaskComplexity.COMPLEX:
            return {"effort": "high", "thinking_budget": 4096, "critic_passes": 1}
        elif complexity == TaskComplexity.ROUTINE:
            return {"effort": "medium", "thinking_budget": 1024, "critic_passes": 0}
        else:
            return {"effort": "low", "thinking_budget": 0, "critic_passes": 0}

effort_router = EffortRouter()
