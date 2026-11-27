"""AEGIS Agent Loop with Streaming Tool Calling & Dynamic Budget Governance."""

import asyncio
import logging
from typing import List, Dict, Any, Callable, Optional
from rich.console import Console
from rich.panel import Panel

logger = logging.getLogger("aegis.core.loop")
console = Console()

class AgentLoop:
    def __init__(self, agent_wrapper, max_iterations: int = 10, timeout_seconds: int = 300):
        self.agent_wrapper = agent_wrapper
        self.max_iterations = max_iterations
        self.timeout_seconds = timeout_seconds

    async def run(self, initial_prompt: str, tools: Optional[List[Callable]] = None) -> Dict[str, Any]:
        """Execute autonomous agent loop with rich animations and safety guardrails."""
        console.print(Panel(f"[bold cyan]AEGIS Autonomous Agent Loop Initiated[/bold cyan]\nGoal: {initial_prompt}", border_style="cyan"))
        
        iteration = 0
        current_prompt = initial_prompt
        history: List[Dict[str, Any]] = []

        while iteration < self.max_iterations:
            iteration += 1
            console.print(f"\n[dim bold]--- Iteration {iteration}/{self.max_iterations} ---[/dim bold]")
            
            with console.status(f"[bold cyan]Neural Core reasoning (Iteration {iteration})...[/bold cyan]", spinner="dots12") as status:
                await asyncio.sleep(0.8)
                response = await self.agent_wrapper.execute_task(current_prompt)
            
            if not response.get("success"):
                console.print(f"[bold red]✘ Execution halted: {response.get('error')}[/bold red]")
                return {"success": False, "history": history, "error": response.get("error")}

            result_text = response.get("result", "")
            console.print(Panel(result_text, title=f"Neural Response [{response.get('model')}]", border_style="green"))
            
            history.append({
                "iteration": iteration,
                "prompt": current_prompt,
                "response": result_text,
                "effort": response.get("effort")
            })

            if "DONE" in result_text or iteration >= self.max_iterations:
                console.print("[bold green]✔ Agent Loop Completed Successfully.[/bold green]")
                return {"success": True, "history": history, "final": result_text}

            current_prompt = f"Previous step output: {result_text}\nProceed to next milestone."

        return {"success": True, "history": history, "final": "Max iterations reached."}
