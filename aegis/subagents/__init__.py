"""AEGIS Specialized Subagents."""

class BaseSubagent:
    def __init__(self, name: str):
        self.name = name

    def execute(self, task: str):
        return f"Subagent [{self.name}] executed task: {task}"

class SecuritySubagent(BaseSubagent):
    def __init__(self):
        super().__init__("security")

class DeploySubagent(BaseSubagent):
    def __init__(self):
        super().__init__("deploy")

class MonitorSubagent(BaseSubagent):
    def __init__(self):
        super().__init__("monitor")
