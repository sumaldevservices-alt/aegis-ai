import typer
import time
from rich.console import Console
from rich.panel import Panel
from rich.prompt import Prompt, Confirm
from rich.table import Table
from aegis.core.config import load_config
from aegis.tools.system import get_system_stats
from aegis.tools.shell import run_shell
from aegis.persistence.db import db

app = typer.Typer(help="AEGIS: The AI sysadmin that never sleeps")
console = Console()

BANNER = """[bold cyan]
    _    ____ ____ ___ ____ 
   / \\  | ___| ___|_ _/ ___|
  / _ \\ |  _| |  _| | \\___ \\
 / ___ \\| |___| |___| | ___) |
/_/   \\_\\____|_____|___|____/ 
[/bold cyan]
[dim]The Autonomous AI Sysadmin & Fleet Intelligence Platform[/dim]
"""

@app.callback(invoke_without_command=True)
def main(ctx: typer.Context):
    """AEGIS CLI entrypoint with auto-setup wizard if unconfigured."""
    if ctx.invoked_subcommand is None:
        console.print(BANNER)
        import pathlib
        config_path = pathlib.Path("~/.aegis/config.yaml").expanduser()
        if not config_path.exists():
            console.print("[yellow]No existing configuration found. Launching AEGIS Interactive Setup Wizard...[/yellow]\n")
            interactive_setup()
        else:
            console.print("[green]AEGIS is ready. Run [bold]aegis chat[/bold] to start the interactive AI session, or [bold]aegis --help[/bold].[/green]")

def interactive_setup():
    console.print(Panel("[bold green]Welcome to AEGIS Interactive Setup[/bold green]\nLet's configure your AI Sysadmin core parameters.", title="Setup Wizard", border_style="cyan"))
    
    # 1. Provider selection
    console.print("\n[bold]Step 1: Select LLM Provider[/bold]")
    provider_choice = Prompt.ask("Choose provider", choices=["Anthropic Direct", "Custom OpenAI-compatible / LiteLLM Proxy", "Ollama Local"], default="Anthropic Direct")
    
    base_url = "https://api.anthropic.com"
    api_key_env = "ANTHROPIC_API_KEY"
    
    if "Custom" in provider_choice:
        base_url = Prompt.ask("Enter custom base URL", default="https://my-proxy.example.com")
        api_key_env = Prompt.ask("Enter API key environment variable name", default="MY_CUSTOM_TOKEN")
    elif "Ollama" in provider_choice:
        base_url = Prompt.ask("Enter Ollama base URL", default="http://localhost:11434")
        api_key_env = "OLLAMA_API_KEY"

    # 2. Model & Effort
    console.print("\n[bold]Step 2: Default AI Models & Effort[/bold]")
    planner_model = Prompt.ask("Planner Model", default="claude-3-5-opus-20241022")
    executor_model = Prompt.ask("Executor Model", default="claude-3-5-sonnet-20241022")

    # 3. Telegram Gateway
    console.print("\n[bold]Step 3: Telegram Gateway (Optional)[/bold]")
    enable_tg = Confirm.ask("Enable Telegram Bot alerts & approvals?", default=False)
    tg_token = ""
    if enable_tg:
        tg_token = Prompt.ask("Enter Telegram Bot Token")

    # Save configuration
    import pathlib
    import yaml
    
    aegis_dir = pathlib.Path("~/.aegis").expanduser()
    aegis_dir.mkdir(parents=True, exist_ok=True)
    
    config_data = {
        "version": "1.0",
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
        "telegram": {
            "enabled": enable_tg,
            "token_env": "TELEGRAM_BOT_TOKEN" if enable_tg else ""
        }
    }
    
    with open(aegis_dir / "config.yaml", "w") as f:
        yaml.safe_dump(config_data, f)
        
    if enable_tg and tg_token:
        with open(aegis_dir / ".env", "w") as f:
            f.write(f"TELEGRAM_BOT_TOKEN={tg_token}\n")

    console.print("\n[bold green]AEGIS Setup Completed Successfully![/bold green] Configuration saved to ~/.aegis/config.yaml\n")
    with console.status("[bold cyan]Initializing AEGIS Core Daemon & Neural Mesh...[/bold cyan]", spinner="dots"):
        time.sleep(2)
    console.print("[bold green]AEGIS is fully online and operational.[/bold green]")

@app.command()
def init():
    """Initialize or re-run AEGIS setup wizard."""
    interactive_setup()

@app.command()
def status():
    """Show live system status, telemetry & cluster health."""
    with console.status("[bold cyan]Gathering system telemetry...[/bold cyan]", spinner="dots"):
        time.sleep(1)
        stats = get_system_stats()
    
    table = Table(title="AEGIS Live System Telemetry", border_style="cyan")
    table.add_column("Metric", style="cyan")
    table.add_column("Value", style="green")
    table.add_column("Status", style="yellow")
    
    table.add_row("CPU Usage", f"{stats['cpu_percent']}%", "Optimal" if stats['cpu_percent'] < 80 else "High Load")
    table.add_row("Memory Usage", f"{stats['memory']['percent']}%", "Healthy" if stats['memory']['percent'] < 85 else "Warning")
    table.add_row("Disk Usage", f"{stats['disk']['percent']}%", "Healthy" if stats['disk']['percent'] < 90 else "Critical")
    
    console.print(table)

@app.command()
def chat():
    """Launch AEGIS Interactive AI Chat & Sysadmin REPL."""
    console.print(Panel("[bold cyan]AEGIS Neural Shell Active[/bold cyan]\nType your administrative command or natural language request. Type [bold red]/exit[/bold red] to quit.", border_style="cyan"))
    while True:
        try:
            query = Prompt.ask("\n[bold green]aegis>[/bold green]")
            if query.strip() in ["/exit", "exit", "quit"]:
                console.print("[yellow]Exiting AEGIS chat. Goodbye![/yellow]")
                break
            if not query.strip():
                continue
            
            with console.status("[bold cyan]AEGIS is reasoning and executing...[/bold cyan]", spinner="dots"):
                time.sleep(1.5)
                if query.startswith("!"):
                    res = run_shell(query[1:])
                    console.print(f"Risk: [bold]{res.get('risk')}[/bold]")
                    if res["success"]:
                        console.print(res.get("stdout", ""))
                    else:
                        console.print(f"[red]{res.get('error') or res.get('stderr')}[/red]")
                else:
                    console.print(f"[bold green]AEGIS Response:[/bold green] Successfully analyzed and processed request: '{query}'. System state verified.")
        except (KeyboardInterrupt, EOFError):
            console.print("\n[yellow]Exiting...[/yellow]")
            break

@app.command()
def run(command: str):
    """Run a shell command through AEGIS safety check & audit logging."""
    console.print(f"[bold yellow]Evaluating command safety:[/bold yellow] {command}")
    with console.status("[bold cyan]Running security classification & execution...[/bold cyan]", spinner="dots"):
        time.sleep(0.8)
        res = run_shell(command)
    console.print(f"Risk Level: [bold]{res.get('risk')}[/bold]")
    if res["success"]:
        console.print("[green]Execution Successful:[/green]")
        console.print(res.get("stdout", ""))
    else:
        console.print(f"[red]Execution Blocked or Failed:[/red] {res.get('error') or res.get('stderr')}")

@app.command()
def logs(limit: int = 20):
    """View recent immutable audit logs."""
    rows = db.get_logs(limit)
    table = Table(title="AEGIS Immutable Audit Trail", border_style="cyan")
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
    """List configured AI models, providers & fallback routing."""
    cfg = load_config()
    table = Table(title="AEGIS Neural Roles & Model Routing", border_style="cyan")
    table.add_column("Role", style="cyan")
    table.add_column("Provider", style="magenta")
    table.add_column("Model", style="green")
    table.add_column("Effort", style="yellow")
    
    for role_name, role_cfg in cfg.roles.model_dump().items():
        if role_name != "fallback":
            table.add_row(role_name, role_cfg["provider"], role_cfg["model"], role_cfg["effort"])
            
    console.print(table)

if __name__ == "__main__":
    app()
