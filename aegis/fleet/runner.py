"""AEGIS Fleet Management & Rollout Runner."""

import subprocess
from typing import List, Dict, Any, Optional

class FleetRunner:
    def __init__(self, hosts: Optional[List[str]] = None):
        self.hosts = hosts or ["localhost"]

    def run_on_fleet(self, command: str, timeout: int = 30) -> Dict[str, Any]:
        results = {}
        for host in self.hosts:
            if host in ("localhost", "127.0.0.1"):
                try:
                    res = subprocess.run(
                        command,
                        shell=True,
                        capture_output=True,
                        text=True,
                        timeout=timeout
                    )
                    success = res.returncode == 0
                    results[host] = {
                        "success": success,
                        "stdout": res.stdout,
                        "stderr": res.stderr,
                        "exit_code": res.returncode
                    }
                except Exception as e:
                    results[host] = {
                        "success": False,
                        "error": str(e)
                    }
            else:
                # Remote SSH execution attempt
                try:
                    ssh_cmd = f"ssh -o ConnectTimeout=5 -o StrictHostKeyChecking=no {host} '{command}'"
                    res = subprocess.run(
                        ssh_cmd,
                        shell=True,
                        capture_output=True,
                        text=True,
                        timeout=timeout
                    )
                    success = res.returncode == 0
                    results[host] = {
                        "success": success,
                        "stdout": res.stdout,
                        "stderr": res.stderr,
                        "exit_code": res.returncode
                    }
                except Exception as e:
                    results[host] = {
                        "success": False,
                        "error": str(e)
                    }
        return results

fleet_runner = FleetRunner()
