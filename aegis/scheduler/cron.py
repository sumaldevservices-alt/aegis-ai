"""AEGIS Scheduler & Proactive Monitoring Daemon."""

from typing import Dict, Any, List

class Scheduler:
    def __init__(self):
        self.jobs: List[Dict[str, Any]] = [
            {"id": 1, "name": "Hourly Disk Check", "cron": "0 * * * *", "status": "active"},
            {"id": 2, "name": "Daily Security Audit", "cron": "0 0 * * *", "status": "active"}
        ]

    def list_jobs(self) -> List[Dict[str, Any]]:
        return self.jobs

scheduler = Scheduler()
