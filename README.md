<div align="center">

# 🛡️ A E G I S
### *The Sovereign Autonomous AI Sysadmin & Fleet Intelligence Platform*
**Powered by Claude Agent SDK & Hermes Agent Architecture**

[![Python 3.11+](https://img.shields.io/badge/python-3.11%20%7C%203.12%20%7C%203.13%20%7C%203.14-blue?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-005571?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Typer](https://img.shields.io/badge/Typer-CLI-0af?style=for-the-badge&logo=typer&logoColor=white)](https://typer.tiangolo.com/)
[![SQLite WAL](https://img.shields.io/badge/SQLite-WAL%20%2B%20FTS5-003B57?style=for-the-badge&logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

</div>

---

## ⚡ ARCHITECTURAL MANIFESTO

**AEGIS** is built for elite infrastructure engineers who demand zero-downtime autonomy combined with absolute cryptographic safety. Operating as a unified daemon (`aegisd`) across local VPS instances and distributed clusters, AEGIS seamlessly bridges LLM cognitive reasoning with deterministic system execution.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        AEGIS MULTI-INTERFACE MESH                      │
│   [ CLI / REPL ]   [ Textual TUI ]   [ Web UI ]   [ Telegram Gateway ] │
└───────────────────────────────────────────────────┬────────────────────┘
                                                    │
                                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                         AEGIS NEURAL CORE (aegisd)                     │
│  ┌─────────────────────┐  ┌───────────────────────┐  ┌──────────────┐  │
│  │  Effort Router      │  │  AST Safety Engine    │  │ SQLite WAL   │  │
│  │  (Trivial ➔ Max)    │  │  (READ ➔ HIGH Risk)   │  │ Audit & FTS5 │  │
│  └─────────────────────┘  └───────────────────────┘  └──────────────┘  │
└───────────────────────────────────────────────────┬────────────────────┘
                                                    │
                                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        DETERMINISTIC EXECUTORS                         │
│   [ Shell / SSH ] [ Docker / Compose ] [ Obscura Browser ] [ Fleet ]   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 💎 CORE CAPABILITIES

- **🧠 Adaptive Reasoning & Effort Routing**: Automatically classifies tasks as `trivial`, `routine`, `complex`, or `critical`, dynamically scaling extended thinking budgets and multi-critic validation passes.
- **🛡️ 4-Tier AST Safety Guardrails**: Real-time regex and AST command analysis (`READ`, `LOW`, `MEDIUM`, `HIGH`). High-risk operations trigger mandatory approval flows and cryptographic backups.
- **🌐 Obscura-Inspired Web Intelligence**: Headless DOM parsing, live web extraction, and documentation synthesis.
- **👥 Sovereign Fleet Orchestration**: Distributed asynchronous execution across multi-node server meshes with rolling canary deployments.
- **🧬 Self-Healing Evolution Engine**: Nightly telemetry analysis, skill auto-discovery, and sandboxed trace benchmarking to autonomously optimize system administration workflows.

---

## 🚀 60-SECOND INSTANT SETUP

```bash
# 1. Clone your sovereign repository
git clone https://github.com/sumaldevservices-alt/aegis-ai.git
cd aegis-ai

# 2. Initialize isolated Python environment
python3 -m venv venv
source venv/bin/activate

# 3. Install in editable mode
pip install -e .

# 4. Launch the Interactive Setup Wizard & Neural Core
aegis
```

---

## 🎮 COMMAND MATRIX & CLI REFERENCE

| Command | Action | Description |
| :--- | :--- | :--- |
| `aegis` | `init` | Launch the interactive provider & security calibration wizard |
| `aegis status` | `telemetry` | Inspect real-time CPU, virtual memory, and disk health metrics |
| `aegis chat` | `repl` | Enter the high-effort interactive AI neural shell |
| `aegis run` | `execute` | Safely evaluate and execute shell commands through the AST engine |
| `aegis browse` | `web` | Extract web page content using the Obscura headless browser engine |
| `aegis fleet` | `distribute` | Broadcast administrative commands across distributed server nodes |
| `aegis models` | `routing` | Inspect neural role assignments and fallback provider chains |
| `aegis logs` | `audit` | Query immutable SQLite WAL audit trails |
| `aegis memory` | `fts5` | Query episodic historical facts and context indexes |
| `aegis schedule` | `cron` | Monitor active cron timers and proactive background daemons |
| `aegis evolve` | `self-heal` | Trigger AI skill optimization and benchmarked evolution loops |
| `aegis doctor` | `diagnose` | Execute comprehensive system self-diagnosis and integrity checks |

---

## 🛠️ TESTING & VERIFICATION

```bash
# Run full unit and safety integration test suite
PYTHONPATH=. venv/bin/pytest -v tests/test_aegis.py
```

---

## 📜 LICENSE

AEGIS is open-source software released under the [MIT License](LICENSE).
