"""AEGIS AI Agent Integration with Claude API."""

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
        provider_name = role_cfg.provider
        provider = self.config.providers.get(provider_name)
        
        api_key = os.getenv("ANTHROPIC_API_KEY")
        if not api_key and provider and provider.api_key_env:
            api_key = os.getenv(provider.api_key_env)

        if not api_key:
            return {
                "prompt": prompt,
                "complexity": complexity.value,
                "model": role_cfg.model,
                "effort": effort_cfg["effort"],
                "success": False,
                "error": "Anthropic API key not found in environment (ANTHROPIC_API_KEY)."
            }

        try:
            import anthropic
            client = anthropic.Anthropic(api_key=api_key)
            response = client.messages.create(
                model=role_cfg.model,
                max_tokens=2048,
                messages=[{"role": "user", "content": prompt}]
            )
            content = response.content[0].text if response.content else ""
            return {
                "prompt": prompt,
                "complexity": complexity.value,
                "model": role_cfg.model,
                "effort": effort_cfg["effort"],
                "success": True,
                "result": content
            }
        except Exception as e:
            return {
                "prompt": prompt,
                "complexity": complexity.value,
                "model": role_cfg.model,
                "effort": effort_cfg["effort"],
                "success": False,
                "error": str(e)
            }

agent_wrapper = AegisAgentWrapper()
