import typer
from rich.console import Console
from rich.table import Table
from aegis.core.config import load_config
from aegis.tools.system import get_system_stats
from aegis.tools.shell import run_shell

app = typer.Typer(help="AEGIS: The AI sysadmin that never sleeps")
console = Console()

@app.command()
def init():
    """Initialize AEGIS configuration and directories."""
    console.print("[bold green]Initializing AEGIS...[/bold green]")
    import pathlib
    pathlib.Path("~/.aegis").expanduser().mkdir(parents=True, exist_ok=True)
    console.print("[green]AEGIS initialized successfully at ~/.aegis[/green]")

@app.command()
def status():
    """Show system status and metrics."""
    stats = get_system_stats()
    console.print("[bold cyan]AEGIS System Status[/bold cyan]")
    console.print(f"CPU Usage: {stats['cpu_percent']}%")
    console.print(f"Memory Usage: {stats['memory']['percent']}%")
    console.print(f"Disk Usage: {stats['disk']['percent']}%")

@app.command()
def run(command: str):
    """Run a shell command through AEGIS safety check."""
    console.print(f"[bold yellow]Running command:[/bold yellow] {command}")
    res = run_shell(command)
    console.print(f"Risk Level: [bold]{res.get('risk')}[/bold]")
    if res["success"]:
        console.print("[green]Success:[/green]")
        console.print(res.get("stdout", ""))
    else:
        console.print(f"[red]Error/Blocked:[/red] {res.get('error') or res.get('stderr')}")

@app.command()
def models():
    """List configured AI models and providers."""
    cfg = load_config()
    table = Table(title="AEGIS Roles & Models")
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
