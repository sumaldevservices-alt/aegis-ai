<p align="center">
  <pre>
    _    ____ ____ ___ ____    _    ___ 
   / \  | ___| ___|_ _/ ___|  / \  |_ _|
  / _ \ |  _| |  _| | \___ \ / _ \  | | 
 / ___ \| |___| |___| | ___) / ___ \ | | 
/_/   \_\_____|_____|___|____/_/   \_|___|
  </pre>
</p>

<p align="center">
  <strong>The Autonomous AI Sysadmin, Fleet Intelligence & Self-Healing Kernel</strong><br>
  <em>Inspired by Hermes Agent & Claude Agent SDK</em>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Version-2.0.0-cyan.svg" alt="Version">
  <img src="https://img.shields.io/badge/Python-3.11%2B-blue.svg" alt="Python Version">
  <img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License">
  <img src="https://img.shields.io/badge/Status-Production-success.svg" alt="Status">
</p>

---

## 🚀 Overview

**AEGIS** is an enterprise-grade sovereign AI platform designed for autonomous server administration, multi-node fleet management, web intelligence, and self-healing infrastructure. Powered by advanced reasoning effort routing, AST safety classification, and a zero-trust persistence layer, AEGIS operates as the intelligent core that never sleeps.

---

## 🌟 Key Architecture & Features

### 1. 🧠 Neural Model Routing & Multi-Provider Support
- **Flexible Backends**: Native support for Anthropic Claude, OpenRouter, Ollama (Local Sovereign LLMs), and Custom OpenAI-compatible / LiteLLM proxies.
- **Role-Based Effort Calibration**: Dynamic allocation of reasoning budgets across Planner, Executor, Fast, and Critic roles (`max`, `high`, `medium`, `low`).

### 2. 🛡️ Advanced Safety & AST Policy Engine
- **4-Tier Risk Classification**: Automatic categorization of tasks into `READ`, `LOW`, `MEDIUM`, and `HIGH` risk levels.
- **Lockout Protection & Guardrails**: Hard blocklists against destructive operations (`rm -rf /`, raw disk formatting) with automated pre-flight security checks.
- **Immutable Audit Trail**: SQLite WAL-backed append-only audit logging for every executed command, timestamp, and risk profile.

### 3. 🌐 Obscura-Inspired Web & Browser Intelligence
- Headless web page extraction, DOM parsing, and URL monitoring capabilities for automated diagnostic research and documentation gathering.

### 4. 👥 Enterprise Fleet Management
- Simultaneous administrative rollout, health verification, and zero-downtime updates across single or multiple distributed server nodes.

### 5. 🧬 Evolution Engine & Memory Store
- **FTS5 Knowledge Graph**: Persistent episodic memory and fact indexing for rapid retrieval of past incidents and operational patterns.
- **Skill Discovery & Self-Improvement**: Automated trace analysis to synthesize, test, and promote optimized administrative skills.

---

## 📦 Installation Guide

Clone the repository and set up your sovereign virtual environment:

```bash
git clone https://github.com/sumaldevservices-alt/aegis-ai.git
cd aegis-ai

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate

# Install package in editable mode with all dependencies
pip install -e .
```

---

## ⚡ Quick Start & First-Run Wizard

When you invoke `aegis` for the very first time, an interactive setup wizard will automatically launch to calibrate your sovereign core:

```bash
aegis
```

### Setup Wizard Steps:
1. **Neural Backend Selection**: Choose between Anthropic Claude, Custom Proxy, Ollama, or OpenRouter.
2. **Model Assignment**: Configure your Architect (Planner) and Worker (Executor) models.
3. **Autonomy Guardrails**: Set your operational autonomy level (`L0` to `L3`).
4. **Telegram Gateway**: Optionally link your Telegram Bot for remote mobile command and approval buttons.

---

## 💻 Complete CLI Reference Table

| Command | Description | Example |
| :--- | :--- | :--- |
| `aegis` / `aegis init` | Launch interactive setup wizard | `aegis init` |
| `aegis status` | Display live system telemetry & OS health | `aegis status` |
| `aegis chat` | Start interactive AI Neural Shell REPL | `aegis chat` |
| `aegis run` | Execute command through AST safety engine | `aegis run "df -h"` |
| `aegis browse` | Fetch & extract web page content (Obscura engine) | `aegis browse "https://example.com"` |
| `aegis fleet` | Run administrative commands across server fleet | `aegis fleet "uptime"` |
| `aegis models` | Inspect neural routing and model profiles | `aegis models` |
| `aegis logs` | View immutable SQLite audit trail | `aegis logs --limit 50` |
| `aegis memory` | Search FTS5 fact store and episodic history | `aegis memory "nginx"` |
| `aegis schedule` | List active cron jobs and monitoring daemons | `aegis schedule` |
| `aegis evolve` | Trigger skill self-optimization engine | `aegis evolve "sysadmin"` |
| `aegis doctor` | Run full system self-healing diagnostics | `aegis doctor` |

---

## 🧪 Running Test Suites

Execute the unit and safety test suites using pytest:

```bash
PYTHONPATH=. venv/bin/pytest tests/test_aegis.py
```

---

## 🛡️ License

Distributed under the **MIT License**. See `LICENSE` for more information.
