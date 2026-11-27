# Aegis CLI Reference

Live sources when anything looks stale: `aegis --help`, `aegis <command> --help`,
https://aegis-agent.nousresearch.com/docs/reference/cli-commands

### Global Flags

```
aegis [flags] [command]        (no subcommand = interactive chat)

  --version, -V             Show version
  -z, --oneshot PROMPT      One-shot: print ONLY the final response (for scripts/pipes)
  -m MODEL  --provider P    Model/provider override for this invocation
  -t, --toolsets LIST       Comma-separated toolsets for this invocation
  --resume, -r SESSION      Resume session by ID or title
  --continue, -c [NAME]     Resume by name, or most recent session
  --worktree, -w            Isolated git worktree mode (parallel agents)
  --skills, -s SKILL        Preload skills (comma-separate or repeat)
  --profile, -p NAME        Use a named profile
  --yolo                    Skip dangerous command approval
  --tui / --cli             Force the Ink TUI / classic REPL
  --ignore-rules            Skip AGENTS.md/SOUL.md/memory/skill injection
  --safe-mode               Disable ALL customizations (troubleshooting)
  --pass-session-id         Include session ID in system prompt
```

### Chat

```
aegis chat [flags]
  -q, --query TEXT          Single query, non-interactive
  --image PATH              Attach a local image to a single query
  -Q, --quiet               Suppress banner, spinner, tool previews
  --checkpoints             Enable filesystem checkpoints (/rollback)
  --max-turns N             Cap tool-calling iterations
  --source TAG              Session source tag (default: cli)
```
(plus the global flags above)

### Configuration

```
aegis setup [section]      Wizard (model|tts|terminal|gateway|tools|agent)
aegis model                Interactive model/provider picker
aegis fallback [add|remove|list]  Fallback provider chain
aegis config [show|edit|get|set|unset|path|env-path|check|migrate]
aegis login / logout       OAuth sign-in / clear stored auth
aegis doctor [--fix]       Check dependencies and config
aegis status [--full]      Component summary (--full: every section)
```

### Tools & Skills

```
aegis tools [list|enable NAME|disable NAME]   Per-platform toolsets (curses UI with no args)

aegis skills list|browse|search QUERY|inspect ID
aegis skills install ID    Hub identifier OR a direct https://…/SKILL.md URL
aegis skills config        Enable/disable skills per platform
aegis skills check|update|uninstall|publish PATH
aegis skills tap add REPO  Add a GitHub repo as a skill source
aegis bundles              Skill bundles (one /<name> alias loads several skills)
```

### MCP Servers

```
aegis mcp add NAME (--url or --command) | remove | list | test NAME
aegis mcp catalog | install NAME     Curated catalog install
aegis mcp configure NAME             Toggle tool selection
aegis mcp-serve                      Run Aegis as an MCP server (mcp-serve plugin)
```
Details (transport, tool discovery, catalog): `references/native-mcp.md`.

### Gateway (Messaging Platforms)

```
aegis gateway run|install|start|stop|restart|status|setup
```

20+ platforms: Telegram, Discord, Slack, WhatsApp (Baileys + Business Cloud API), iMessage (Photon — `aegis photon setup`), Signal, Email, SMS, Matrix, Mattermost, Teams, LINE, SimpleX, ntfy, Google Chat, Home Assistant, DingTalk, Feishu, WeCom, Weixin, API Server, Webhooks. Open WebUI connects via the API Server adapter. Most adapters ship under `plugins/platforms/`.
Docs: https://aegis-agent.nousresearch.com/docs/user-guide/messaging/

### Sessions

```
aegis sessions list|browse|rename ID TITLE|delete ID|export OUT|prune|stats
```

### Cron / Webhooks

```
aegis cron list|create SCHED|edit ID|pause|resume|run ID|remove|status
    Schedules: '30m', 'every 2h', '0 9 * * *', ISO timestamp
aegis webhook subscribe NAME|list|remove NAME|test NAME
```
Webhook payloads/routes: `references/webhooks.md`.

### Profiles

```
aegis profile list|create NAME (--clone|--clone-all|--clone-from)|use|show|delete
aegis profile rename A B | alias NAME | export NAME | import FILE
aegis profile migrate-identity A B   Retry a completed rename's session/routing identity migration
```

### Credentials & Pools

```
aegis auth                 Interactive credential manager
aegis auth add [PROVIDER]  Add OAuth or API-key credential (nous, openai-codex, qwen-oauth, …)
aegis auth list|remove P IDX|reset PROVIDER|status
```
Multiple credentials per provider form a pool that rotates automatically and skips exhausted keys.

### Other

```
aegis desktop / gui        Native desktop app
aegis dashboard            Web admin panel + embedded chat (--stop / --status)
aegis proxy                OpenAI-compatible local proxy backed by an OAuth provider
aegis portal               Quick setup / sign in via Nous Portal
aegis kanban <verb>        Multi-agent work-queue board
aegis project              Named multi-folder workspaces (see references/projects-and-folders.md)
aegis skin list|use|set    Switch/tweak skins (see references/themes.md)
aegis pets <verb>          Pet mascots (see references/petdex.md)
aegis memory setup|status|off|reset   Memory provider
aegis secrets bitwarden|onepassword   External secret stores
aegis moa                  Mixture-of-Agents slots
aegis hooks / security / backup / import / checkpoints / console
aegis logs [-f] [errors]   View agent/error logs
aegis send                 One-off message through a gateway platform
aegis pairing / plugins / insights / journey / computer-use
aegis acp                  ACP server (IDE integration)
aegis completion bash|zsh|fish
aegis update / uninstall
```

Plugin- and provider-supplied subcommands (e.g. `aegis photon setup`) only appear once their plugin is installed/active. Importing from OpenClaw, Claude Code, Codex CLI or Cursor (`aegis import-agent <agent>`, plus the older `aegis claw migrate|cleanup`) comes from the `agent-importers` plugin; a fresh `aegis setup` that finds one of those agents offers to install it.

### Where to Find Things

| Looking for... | Location |
|---|---|
| Config options | `aegis config edit` · [Configuration docs](https://aegis-agent.nousresearch.com/docs/user-guide/configuration) |
| Tools / toolsets | `aegis tools list` · [Tools reference](https://aegis-agent.nousresearch.com/docs/reference/tools-reference) |
| Skills catalog | `aegis skills browse` · [Skills catalog](https://aegis-agent.nousresearch.com/docs/reference/skills-catalog) |
| Provider setup | `aegis model` · [Providers guide](https://aegis-agent.nousresearch.com/docs/integrations/providers) |
| Env variables | `aegis config env-path` · [Env vars reference](https://aegis-agent.nousresearch.com/docs/reference/environment-variables) |
| Gateway logs | `~/.aegis/logs/gateway.log` (or `aegis logs`) |
| Sessions | `aegis sessions browse` (reads state.db) |
