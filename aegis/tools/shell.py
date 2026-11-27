import subprocess
from typing import Dict, Any
from aegis.core.safety import safety_engine, RiskLevel
from aegis.persistence.db import db

def run_shell(command: str, timeout: int = 60) -> Dict[str, Any]:
    risk = safety_engine.classify_command(command)
    if risk == RiskLevel.HIGH:
        res = {
            "success": False,
            "error": f"Command blocked by safety engine (Risk: HIGH): {command}",
            "risk": risk.value
        }
        db.log_command(command, risk.value, False, res["error"])
        return res
    
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            timeout=timeout
        )
        success = result.returncode == 0
        output = result.stdout if success else result.stderr
        db.log_command(command, risk.value, success, output)
        return {
            "success": success,
            "stdout": result.stdout,
            "stderr": result.stderr,
            "exit_code": result.returncode,
            "risk": risk.value
        }
    except subprocess.TimeoutExpired:
        err = f"Command timed out after {timeout}s"
        db.log_command(command, risk.value, False, err)
        return {
            "success": False,
            "error": err,
            "risk": risk.value
        }
    except Exception as e:
        err = str(e)
        db.log_command(command, risk.value, False, err)
        return {
            "success": False,
            "error": err,
            "risk": risk.value
        }
