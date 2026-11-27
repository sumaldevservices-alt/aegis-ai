import os
from typing import Dict, Any, Optional
from aegis.core.config import load_config
from aegis.core.effort import effort_router

class AegisAgentWrapper:
    def __init__(self):
        self.config = load_config()

    async def execute_task(self, prompt: str, role: str = "executor") -> Dict[str, Any]:
        complexity = effort_router.classify_task(prompt)
        effort_cfg = effort_router.get_effort_config(complexity)
        
        role_cfg = getattr(self.config.roles, role, self.config.roles.executor)
        
        # Resolve provider
        provider_name = role_cfg.provider
        provider = self.config.providers.get(provider_name)
        
        env = os.environ.copy()
        if provider and provider.api_key_env:
            api_key = os.getenv(provider.api_key_env)
            if api_key:
                env["ANTHROPIC_API_KEY"] = api_key
        if provider and provider.base_url:
            env["ANTHROPIC_BASE_URL"] = provider.base_url

        return {
            "prompt": prompt,
            "complexity": complexity.value,
            "model": role_cfg.model,
            "effort": effort_cfg["effort"],
            "thinking_budget": effort_cfg["thinking_budget"],
            "provider": provider_name,
            "status": "simulated_success",
            "result": f"Executed task '{prompt}' successfully using model {role_cfg.model} with effort {effort_cfg['effort']}."
        }

agent_wrapper = AegisAgentWrapper()
