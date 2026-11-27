# AEGIS: The AI Sysadmin That Never Sleeps

AEGIS is an enterprise-grade autonomous AI agent and fleet intelligence platform designed for VPS and server fleet management, inspired by Hermes Agent and Claude Agent SDK.

## Key Features

- **Autonomous Agent Daemon**: Core daemon monitoring server health, executing administrative tasks, and self-healing.
- **Obscura-Inspired Browser & Web Tools**: Headless web page fetching, DOM extraction, and URL analysis.
- **Safety Engine & AST Classifier**: 4-tier risk classification (`READ`, `LOW`, `MEDIUM`, `HIGH`) with hard blocklists and safety policies.
- **Encrypted Secret Vault**: Secure credential storage using Fernet cryptography.
- **Multi-Provider AI & Effort Router**: Support for Anthropic, Custom Proxies, Ollama (Local), and OpenRouter with dynamic reasoning effort.
- **SQLite Persistence & FTS5 Memory**: Immutable audit trails, episodic memory, and fact stores.
- **Fleet Management & Rollout**: Run administrative tasks and updates across server fleets.
- **Evolution Engine**: Automated skill discovery, optimization, and self-improvement loops.
- **Robust CLI & Interactive Setup**: Rich terminal UI with auto-setup wizard, live telemetry, and interactive REPL (`aegis chat`).

## Installation

```bash
git clone https://github.com/sumaldevservices-alt/aegis-ai.git
cd aegis-ai
python3 -m venv venv
source venv/bin/activate
pip install -e .
```

## First-Run Setup & Usage

When you run `aegis` for the first time, the interactive setup wizard will guide you through provider selection, model configuration, security policies, and Telegram gateway setup.

```bash
aegis init      # Re-run setup wizard
aegis status    # Live server telemetry & health
aegis chat      # Interactive AI Neural Shell REPL
aegis run "..." # Execute command with safety check
aegis browse "https://example.com" # Extract web content
aegis fleet "uptime" # Run across server fleet
aegis models    # Inspect AI routing table
aegis memory "query" # Search memory store
aegis schedule  # View cron jobs
```

## License

MIT
