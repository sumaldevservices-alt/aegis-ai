# AEGIS

AEGIS is an enterprise-grade autonomous AI sysadmin and multi-agent fleet orchestration platform.

## Architecture

```
                      AEGIS MULTI-INTERFACE MESH
           [ CLI / REPL ]  [ TUI Dashboard ]  [ Telegram Bot ]
                                │
                                ▼
                     AEGIS NEURAL CORE (aegisd)
           ┌──────────────────┐    ┌─────────────────────────┐
           │   Effort Router  │    │   AST Safety Engine     │
           │ (Trivial -> Max) │    │   (READ -> HIGH Risk)   │
           └──────────────────┘    └─────────────────────────┘
                                │
                                ▼
                     DETERMINISTIC EXECUTORS
        [ Shell / SSH ] [ Docker ] [ Obscura Web ] [ Fleet ]
```

## Features

- **Neural Effort Router**: Dynamic thinking budget allocation (`trivial` to `max`).
- **4-Tier AST Classifier**: Real-time command risk assessment (`READ`, `LOW`, `MEDIUM`, `HIGH`).
- **Obscura Web Engine**: Headless browser extraction & DOM intelligence.
- **Sovereign Fleet Grid**: Distributed server orchestration & rolling deployments.
- **Self-Healing Evolution**: Automated telemetry analysis & skill optimization.
- **Telegram Gateway**: Inline approval buttons, mobile commands & push alerts.
- **SQLite WAL + FTS5**: Immutable audit logs and episodic memory search.

## Quick Start

```bash
git clone https://github.com/sumaldevservices-alt/aegis-ai.git
cd aegis-ai

python3 -m venv venv
source venv/bin/activate
pip install -e .

aegis
```

## Command Reference

| Command | Description |
| :--- | :--- |
| `aegis` / `aegis init` | Setup wizard & provider calibration |
| `aegis status` | System health & telemetry |
| `aegis chat` | Interactive AI sysadmin shell |
| `aegis run "..."` | Safe AST-validated shell execution |
| `aegis browse "url"` | Web extraction & intelligence |
| `aegis fleet "..."` | Distributed cluster execution |
| `aegis models` | Neural role & fallback configuration |
| `aegis logs` | SQLite WAL audit trail inspection |
| `aegis memory "..."` | FTS5 episodic memory search |
| `aegis schedule` | Cron maintenance daemons |
| `aegis doctor` | System integrity diagnostics |

## Testing

```bash
PYTHONPATH=. venv/bin/pytest -v tests/test_aegis.py
```

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.
