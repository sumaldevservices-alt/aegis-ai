# Instructions for AI Agents Working on AEGIS

## Core Philosophy
- **Zero Hallucination & Real Verification**: Every deliverable must be backed by real tool execution and passing tests (`pytest`).
- **Safety First**: All shell execution and system actions must pass through the 4-tier AST Safety Engine (`aegis/core/safety.py`).
- **Modular Architecture**: Keep code clean, modular, and well-tested in standard top-level directories (`agent`, `gateway`, `tools`, `cron`, `tests`).

## Development Standards
1. Always write unit tests in `tests/` for new features.
2. Run `pytest` before committing any changes.
3. Keep commit messages concise and descriptive.
