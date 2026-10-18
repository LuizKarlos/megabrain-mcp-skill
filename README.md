# MegaBrain MCP Orchestration Skill

Canonical operational skill for interacting with the sovereign **MegaBrain** Model Context Protocol (MCP) server across AI harnesses and coding agents (Hermes, Claude, Cursor, Windsurf, Codex, etc.).

## Contents
- `SKILL.md`: The operational skill specification defining tool sequences, protocols, parameters, and best practices.
- `references/mcp-catalog.md`: Catalog of canonical MegaBrain MCP tools, signatures, and contracts.

## Installation

### Hermes Agent
```bash
mkdir -p ~/.hermes/skills/megabrain && curl -fsSL "https://raw.githubusercontent.com/LuizKarlos/megabrain-mcp-skill/main/SKILL.md" -o ~/.hermes/skills/megabrain/SKILL.md
```

### Claude Desktop
```bash
mkdir -p .agents/skills/megabrain && curl -fsSL "https://raw.githubusercontent.com/LuizKarlos/megabrain-mcp-skill/main/SKILL.md" -o .agents/skills/megabrain/SKILL.md
```

### Cursor IDE
```bash
mkdir -p .cursor/rules && curl -fsSL "https://raw.githubusercontent.com/LuizKarlos/megabrain-mcp-skill/main/SKILL.md" -o .cursor/rules/megabrain.mdc
```

### Windsurf
```bash
mkdir -p .windsurf/rules && curl -fsSL "https://raw.githubusercontent.com/LuizKarlos/megabrain-mcp-skill/main/SKILL.md" -o .windsurf/rules/megabrain.md
```

### Other Harnesses
Download `SKILL.md` directly into your harness's rules or skills directory:
```bash
curl -fsSL "https://raw.githubusercontent.com/LuizKarlos/megabrain-mcp-skill/main/SKILL.md" -o <DESTINATION_PATH>
```

## Quick Start via MCP
Configure your harness's MCP settings to point to your MegaBrain MCP endpoint with your Bearer token:
```json
{
  "mcpServers": {
    "megabrain": {
      "url": "https://mcp.atlascommand.dev/mcp",
      "headers": {
        "Authorization": "Bearer <SEU_TOKEN_MCP>"
      }
    }
  }
}
```
Then invoke `megabrain.health` to verify connectivity.
