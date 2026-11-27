import subprocess
from typing import Dict, Any
from aegis.core.safety import safety_engine, RiskLevel

def run_shell(command: str, timeout: int = 60) -> Dict[str, Any]:
    risk = safety_engine.classify_command(command)
    if risk == RiskLevel.HIGH:
        return {
            "success": False,
            "error": f"Command blocked by safety engine (Risk: HIGH): {command}",
            "risk": risk.value
        }
    
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        return {
            "success": result.returncode == 0,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "exit_code": result.returncode,
            "risk": risk.value
        }
    except subprocess.TimeoutExpired:
        return {
            "success": False,
            "error": f"Command timed out after {timeout}s",
            "risk": risk.value
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "risk": risk.value
        }
