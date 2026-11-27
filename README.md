# AEGIS: The AI Sysadmin That Never Sleeps

AEGIS is an autonomous AI agent and system administration platform designed for VPS and server fleet management.

## Features

- **Autonomous Agent Daemon**: Core daemon (`aegisd`) monitoring server health and executing administrative tasks.
- **Safety Engine**: 4-tier risk classification (`READ`, `LOW`, `MEDIUM`, `HIGH`) with hard blocklists and safety checks.
- **Secure Secret Vault**: Encrypted credential storage using Fernet cryptography.
- **Multi-Provider AI & Effort Router**: Support for Anthropic, OpenAI, and custom proxies with dynamic effort levels.
- **Robust CLI & API**: Typer-based CLI (`aegis`) and FastAPI backend for management.

## Installation

```bash
git clone https://github.com/sumaldevservices-alt/aegis-ai.git
cd aegis-ai
python3 -m venv venv
source venv/bin/activate
pip install -e .
```

## Usage

```bash
aegis init
aegis status
aegis run "uptime"
aegis models
```
