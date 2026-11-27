# AEGIS Progress Tracker

## Implementation Phases

- [x] **Phase 1: Skeleton, Config, Logging, Events, SDK Wrapper, Core Daemon, Shell/System Tools, Basic CLI**
  - Project configuration (`pyproject.toml`, `config.example.yaml`, `.env.example`)
  - Core logging, event bus, config manager
  - Claude Agent SDK wrapper (`aegis/core/agent.py`, options, hooks, session persistence)
  - Core daemon (`aegisd`) and system tools (`shell`, `ssh`, `system`, `docker`)
  - Basic CLI (`aegis init`, `aegis chat`, `aegis run`)

- [ ] **Phase 2: Provider/Model Layer & Effort Router**
  - Multi-provider profiles (base URL, API key, auth token, headers)
  - Failover chain, health checks, pricing
  - Effort router (trivial, routine, complex, critical -> effort levels, thinking budgets)
  - CLI and API model management (`aegis models list|test`, `aegis provider`)

- [ ] **Phase 3: Safety System, Policy Engine, Approvals, Audit, Vault**
  - 4 risk levels (READ, LOW, MEDIUM, HIGH) with AST/regex classifier and LLM secondary opinion
  - Hard blocklist, lockout protection (session safety, auto-revert)
  - Secrets redaction and encrypted vault (`aegis secrets`)
  - Append-only SQLite + JSONL audit log
  - Policy-as-code (`policy.yaml`) and global global panic switch (`aegis panic`)

- [ ] **Phase 4: Telegram Gateway & Approval Buttons**
  - aiogram / python-telegram-bot gateway
  - Inline approval buttons (Approve, Deny, Once, Always, Explain)
  - Telegram commands (`/status`, `/hosts`, `/tasks`, `/approve`, `/panic`, etc.)

- [ ] **Phase 5: Memory, Reflection, Skill Auto-Creation**
  - SQLite FTS5 fact store, episodic history, knowledge graph, profile
  - Task reflection and lesson extraction
  - Skill evolution loop and skill discovery

- [ ] **Phase 6: Subagents, Full Tool Set, Built-in Skills**
  - Specialized subagents (monitor, security, deploy, database, network, backup, researcher, critic)
  - Full tool set (nginx, caddy, firewall, security, packages, backup, db, logs, cron, file, web, browser, notify, memory, skill, plugin, secrets)
  - 30+ built-in SKILL.md folders with scripts

- [ ] **Phase 7: REPL, AI Shell, Textual TUI, Remote Connect**
  - Rich / prompt_toolkit interactive REPL (`aegis chat`) with slash commands and @mentions
  - Textual TUI dashboard (`aegis tui`)
  - AI-assisted shell (`aegis shell`) and remote connection (`aegis connect`)

- [ ] **Phase 8: API Layer, Auth, 2FA, Roles, WebSocket Events**
  - FastAPI app (`aegis/api/`) with JWT auth, password + TOTP 2FA, roles (owner, admin, viewer)
  - OpenAPI docs, WebSocket real-time event stream, webhooks

- [ ] **Phase 9: Web UI & Web Terminal**
  - React + TypeScript + Vite + Tailwind + shadcn/ui frontend (`web/`)
  - xterm.js web terminal with PTY over WebSocket, session recording/replay, AI copilot ghost text
  - All management pages (Dashboard, Chat, Terminal, Hosts, Tasks, Approvals, Skills, Memory, Evolution, Logs, Files, Audit, Providers, Settings, Panic)

- [ ] **Phase 10: Scheduler, Proactive Monitoring, Goals, Budget Governor, Watchdog**
  - Cron / job scheduler, proactive health checks & auto-remediation
  - Standing goals and budget governor (cost tracking, rate limits)
  - Supervisor watchdog (`watchdog.py`, self-health, state backup)

- [ ] **Phase 11: Evolution Engine & Plugins**
  - Skill evolver, memory dreamer, tool forge, plugin loader & quarantine sandbox

- [ ] **Phase 12: Fleet Mode, MCP, Cloud Tools, Observability**
  - Fleet management (1-100+ servers, groups, tags, rolling canary updates)
  - MCP server integration, Prometheus metrics endpoint (`/metrics`)

- [ ] **Phase 13: Docker, CI, Installers, Full Docs, Tests**
  - Dockerfile, docker-compose.yml, install.sh, systemd units
  - Unit, integration, e2e Playwright, safety red-team and chaos tests
  - MkDocs documentation and stunning README
