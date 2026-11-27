from fastapi import FastAPI
from aegis.tools.system import get_system_stats
from aegis.tools.shell import run_shell
from aegis.core.config import load_config

app = FastAPI(title="AEGIS API", version="1.0.0")

@app.get("/health")
def health():
    return {"status": "healthy"}

@app.get("/status")
def status():
    return get_system_stats()

@app.post("/run")
def run(command: str):
    return run_shell(command)

@app.get("/models")
def models():
    cfg = load_config()
    return cfg.roles.model_dump()
