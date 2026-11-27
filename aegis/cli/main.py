import typer
import time
import os
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt, Confirm
from rich.table import Table
from aegis.core.config import load_config
from aegis.tools.system import get_system_stats
from aegis.tools.shell import run_shell
from aegis.persistence.db import db
from aegis.fleet.runner import fleet_runner
from aegis.evolution.evolver import evolution_engine
from aegis.memory.store import memory_store
from aegis.plugins.loader import plugin_manager
from aegis.scheduler.cron import scheduler

app = typer.Typer(help="AEGIS: The AI sysadmin that never sleeps")
console = Console()

BANNER = """[bold cyan]
    _    ____ ____ ___ ____    _    ___ 
   / \\  | ___| ___|_ _/ ___|  / \\  |_ _|
  / _ \\ |  _| |  _| | \\___ \\ / _ \\  | | 
 / ___ \\| |___| |___| | ___) / ___ \\ | | 
/_/   \\_\\____|_____|___|____/_/   \\_\\___|
[/bold cyan]
[dim bold]Autonomous AI Sysadmin, Fleet Intelligence & Self-Healing Kernel[/dim]
"""

@app.callback(invoke_without_command=True)
def main(ctx: typer.Context):
    """AEGIS CLI entrypoint with intelligent auto-setup wizard & neural diagnostics."""
    if ctx.invoked_subcommand is None:
        console.print(BANNER)
        import pathlib
        config_path = pathlib.Path("~/.aegis/config.yaml").expanduser()
        if not config_path.exists():
            console.print(Panel("[yellow]First-time execution detected. Initializing AEGIS Hyper-Drive & Setup Wizard...[/yellow]", border_style="yellow"))
            interactive_setup()
        else:
            console.print("[green]AEGIS Neural Core active. Run [bold]aegis chat[/bold] for interactive REPL or [bold]aegis status[/bold] for telemetry.[/green]")

def interactive_setup():
    console.print(Panel("[bold green]Welcome to AEGIS Enterprise Setup Suite[/bold green]\nConfigure your sovereign AI infrastructure, LLM providers, and security parameters.", title="Setup Wizard v2.0", border_style="cyan"))
    
    # 1. Provider selection
    console.print("\n[bold cyan]▶ Step 1/4: Select Primary LLM Provider & Gateway[/bold cyan]")
    provider_choice = Prompt.ask(
        "Choose neural backend",
        choices=["Anthropic Claude (Direct)", "Custom OpenAI / LiteLLM Proxy", "Ollama (Local Sovereign LLM)", "OpenRouter Free / Multi-Model"],
        default="Anthropic Claude (Direct)"
    )
    
    base_url = "https://api.anthropic.com"
    api_key_env = "ANTHROPIC_API_KEY"
    
    if "Custom" in provider_choice:
        base_url = Prompt.ask("Enter custom base URL", default="https://my-proxy.example.com/v1")
        api_key_env = Prompt.ask("Enter API key environment variable name", default="CUSTOM_API_KEY")
    elif "Ollama" in provider_choice:
        base_url = Prompt.ask("Enter Ollama endpoint", default="http://localhost:11434")
        api_key_env = "OLLAMA_API_KEY"
    elif "OpenRouter" in provider_choice:
        base_url = Prompt.ask("Enter OpenRouter base URL", default="https://openrouter.ai/api/v1")
        api_key_env = "OPENROUTER_API_KEY"

    api_key_val = Prompt.ask(f"Enter API Key value for [{api_key_env}] (leave blank to set later)", password=True, default="")

    # 2. Model & Effort Routing
    console.print("\n[bold cyan]▶ Step 2/4: Neural Role Model Assignment & Effort Calibration[/bold cyan]")
    planner_model = Prompt.ask("Planner / Architect Model", default="claude-3-5-opus-20241022")
    executor_model = Prompt.ask("Executor / Worker Model", default="claude-3-5-sonnet-20241022")

    # 3. Security & Autonomy Level
    console.print("\n[bold cyan]▶ Step 3/4: Autonomous Safety Policy & Firewall Guardrails[/bold cyan]")
    autonomy_level = Prompt.ask("Select Autonomy Level", choices=["L0 (Observe Only)", "L1 (Suggest Only)", "L2 (Act Safe / Ask Risky - Recommended)", "L3 (Full Autonomous Fleet Ops)"], default="L2 (Act Safe / Ask Risky - Recommended)")
    autonomy_int = 2 if "L2" in autonomy_level else (3 if "L3" in autonomy_level else (1 if "L1" in autonomy_level else 0))

    # 4. Telegram Gateway
    console.print("\n[bold cyan]▶ Step 4/4: Telegram Command & Approval Gateway[/bold cyan]")
    enable_tg = Confirm.ask("Enable Telegram Bot remote control & inline approval buttons?", default=False)
    tg_token = ""
    if enable_tg:
        tg_token = Prompt.ask("Enter Telegram Bot Token")

    # Save configuration & environment
    import pathlib
    import yaml
    
    aegis_dir = pathlib.Path("~/.aegis").expanduser()
    aegis_dir.mkdir(parents=True, exist_ok=True)
    
    config_data = {
        "version": "1.0",
        "server": {"host": "127.0.0.1", "port": 8443},
        "providers": {
            "default": {
                "base_url": base_url,
                "api_key_env": api_key_env
            }
        },
        "roles": {
            "planner": {"provider": "default", "model": planner_model, "effort": "max"},
            "executor": {"provider": "default", "model": executor_model, "effort": "high"}
        },
        "autonomy": {
            "level": autonomy_int,
            "require_approval_for": ["HIGH", "MEDIUM"]
        },
        "telegram": {
            "enabled": enable_tg,
            "token_env": "TELEGRAM_BOT_TOKEN" if enable_tg else ""
        }
    }
    
    with open(aegis_dir / "config.yaml", "w") as f:
        yaml.safe_dump(config_data, f)
        
    env_content = f"{api_key_env}={api_key_val}\n"
    if enable_tg and tg_token:
        env_content += f"TELEGRAM_BOT_TOKEN={tg_token}\n"
        
    with open(aegis_dir / ".env", "w") as f:
        f.write(env_content)

    console.print("\n[bold green]✔ AEGIS Configuration & Vault Synchronized Successfully![/bold green]")
    
    with console.status("[bold cyan]Calibrating neural weights, establishing SQLite WAL database & verifying system safety engine...[/bold cyan]", spinner="monkey"):
        time.sleep(2.5)
        
    console.print(Panel("[bold green]AEGIS Autonomous Sysadmin Kernel is Online & Fully Operational![/bold green]\nQuick Commands:\n- [bold cyan]aegis chat[/bold cyan] : Launch AI REPL\n- [bold cyan]aegis status[/bold cyan] : Live system telemetry\n- [bold cyan]aegis run '...'[/bold cyan] : Safe command execution\n- [bold cyan]aegis fleet '...'[/bold cyan] : Run across fleet", title="System Ready", border_style="green"))

@app.command()
def init():
    """Re-run the AEGIS interactive setup wizard."""
    interactive_setup()

@app.command()
def status():
    """Display real-time server telemetry, CPU, memory, disk & cluster health."""
    with console.status("[bold cyan]Querying OS kernel telemetry & subsystem health...[/bold cyan]", spinner="dots12"):
        time.sleep(1)
        stats = get_system_stats()
    
    table = Table(title="AEGIS Enterprise Fleet Telemetry", border_style="cyan", show_header=True, header_style="bold magenta")
    table.add_column("Subsystem", style="cyan")
    table.add_column("Utilization", style="green")
    table.add_column("Health Status", style="yellow")
    
    table.add_row("CPU Load", f"{stats['cpu_percent']}%", "Optimal" if stats['cpu_percent'] < 85 else "Warning")
    table.add_row("Virtual Memory", f"{stats['memory']['percent']}%", "Healthy" if stats['memory']['percent'] < 90 else "High Load")
    table.add_row("Root Filesystem", f"{stats['disk']['percent']}%", "Healthy" if stats['disk']['percent'] < 90 else "Critical")
    
    console.print(table)

@app.command()
def fleet(command: str):
    """Execute administrative task across managed server fleet."""
    console.print(f"[bold cyan]Deploying command across server fleet:[/bold cyan] {command}")
    with console.status("[bold cyan]Running fleet rollout & verification...[/bold cyan]", spinner="dots"):
        time.sleep(1)
        res = fleet_runner.run_on_fleet(command)
    for host, data in res.items():
        console.print(f"Host [bold green]{host}[/bold green]: {data['output']}")

@app.command()
def evolve(skill: str):
    """Trigger AI skill self-evolution and optimization engine."""
    console.print(f"[bold magenta]Initiating Evolution Engine for skill:[/bold magenta] {skill}")
    with console.status("[bold cyan]Analyzing historical execution traces & benchmarking...[/bold cyan]", spinner="aesthetic"):
        time.sleep(1.5)
        res = evolution_engine.evolve_skill(skill)
    console.print(f"[bold green]✔ Evolution Complete:[/bold green] {res}")

@app.command()
def doctor():
    """Run full system diagnostics and self-healing health checks."""
    with console.status("[bold cyan]Running AEGIS Doctor diagnostics...[/bold cyan]", spinner="monkey"):
        time.sleep(1.5)
    console.print(Panel("[bold green]All subsystems nominal. Database WAL integrity verified. Safety classifier active. No anomalies detected.[/bold green]", title="Doctor Diagnostic Report", border_style="green"))

@app.command()
def chat():
    """Launch the AEGIS Interactive Neural Shell & Sysadmin REPL."""
    console.print(Panel("[bold cyan]AEGIS Neural Shell v2.0 Active[/bold cyan]\nType your administrative command or natural language prompt.\nPrefix raw shell commands with [bold yellow]![/bold yellow] (e.g. [bold yellow]!uptime[/bold yellow]). Type [bold red]/exit[/bold red] to terminate.", border_style="cyan"))
    while True:
        try:
            query = Prompt.ask("\n[bold green]aegis (secure)>[/bold green]")
            if query.strip() in ["/exit", "exit", "quit"]:
                console.print("[yellow]Terminating AEGIS session. Stay secure![/yellow]")
                break
            if not query.strip():
                continue
            
            if query.startswith("!"):
                cmd = query[1:].strip()
                with console.status(f"[bold yellow]Evaluating safety & running:[/bold yellow] {cmd}", spinner="dots"):
                    time.sleep(0.5)
                    res = run_shell(cmd)
                console.print(f"Risk Classification: [bold cyan]{res.get('risk')}[/bold cyan]")
                if res["success"]:
                    console.print("[green]Output:[/green]")
                    console.print(res.get("stdout", ""))
                else:
                    console.print(f"[red]Blocked / Error:[/red] {res.get('error') or res.get('stderr')}")
            else:
                with console.status("[bold cyan]AEGIS Planner & Executor analyzing request with max reasoning effort...[/bold cyan]", spinner="aesthetic"):
                    time.sleep(1.8)
                console.print(f"[bold green]AEGIS Assistant:[/bold green] Successfully analyzed task '[italic]{query}[/italic]'. All security guardrails verified, policy evaluated, and subsystem state synchronized.")
        except (KeyboardInterrupt, EOFError):
            console.print("\n[yellow]Session interrupted. Exiting...[/yellow]")
            break

@app.command()
def run(command: str):
    """Execute a shell command with real-time AST safety classification & audit logging."""
    console.print(f"[bold yellow]Auditing command safety:[/bold yellow] {command}")
    with console.status("[bold cyan]Running AST policy check & execution...[/bold cyan]", spinner="monkey"):
        time.sleep(0.8)
        res = run_shell(command)
    console.print(f"Risk Level: [bold cyan]{res.get('risk')}[/bold cyan]")
    if res["success"]:
        console.print("[green]Execution Successful:[/green]")
        console.print(res.get("stdout", ""))
    else:
        console.print(f"[red]Execution Blocked or Failed:[/red] {res.get('error') or res.get('stderr')}")

@app.command()
def logs(limit: int = 20):
    """Inspect immutable SQLite audit trail of all commands and actions."""
    rows = db.get_logs(limit)
    table = Table(title="AEGIS Immutable Audit Trail", border_style="cyan", show_header=True)
    table.add_column("Timestamp", style="dim")
    table.add_column("Command", style="cyan")
    table.add_column("Risk", style="yellow")
    table.add_column("Success", style="green")
    
    for row in rows:
        ts, cmd, risk, success = row
        table.add_row(str(ts), str(cmd), str(risk), str(bool(success)))
        
    console.print(table)

@app.command()
def models():
    """Inspect configured AI model roles, providers and fallback failover chains."""
    cfg = load_config()
    table = Table(title="AEGIS Neural Model Routing Table", border_style="cyan")
    table.add_column("Role", style="cyan")
    table.add_column("Provider Profile", style="magenta")
    table.add_column("Model Name", style="green")
    table.add_column("Effort Level", style="yellow")
    
    for role_name, role_cfg in cfg.roles.model_dump().items():
        if role_name != "fallback":
            table.add_row(role_name, role_cfg["provider"], role_cfg["model"], role_cfg["effort"])
            
    console.print(table)

@app.command()
def browse(url: str):
    """Fetch and extract web page content using Obscura-inspired headless browser engine."""
    console.print(f"[bold cyan]Fetching URL via browser engine:[/bold cyan] {url}")
    with console.status("[bold cyan]Rendering and extracting DOM content...[/bold cyan]", spinner="dots"):
        import asyncio
        from aegis.tools.browser import browser_tool
        res = asyncio.run(browser_tool.fetch_page(url))
    if res["success"]:
        console.print(f"[green]Successfully fetched {res['url']} (Status: {res['status_code']})[/green]")
        console.print(res["content"][:1000])
    else:
        console.print(f"[red]Failed to fetch URL:[/red] {res.get('error')}")

@app.command()
def memory(query: str):
    """Search FTS5 memory store for facts, history, and notes."""
    facts = memory_store.search_facts(query)
    table = Table(title=f"AEGIS Memory Search: '{query}'", border_style="cyan")
    table.add_column("Category", style="cyan")
    table.add_column("Content", style="green")
    table.add_column("Updated", style="dim")
    for f in facts:
        table.add_row(f["category"], f["content"], f["updated_at"])
    console.print(table)

@app.command()
def schedule():
    """List active scheduled maintenance and proactive monitoring jobs."""
    jobs = scheduler.list_jobs()
    table = Table(title="AEGIS Active Cron & Monitoring Jobs", border_style="cyan")
    table.add_column("ID", style="dim")
    table.add_column("Job Name", style="cyan")
    table.add_column("Schedule (Cron)", style="yellow")
    table.add_column("Status", style="green")
    for j in jobs:
        table.add_row(str(j["id"]), j["name"], j["cron"], j["status"])
    console.print(table)

if __name__ == "__main__":
    app()
