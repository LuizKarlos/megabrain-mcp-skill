# MegaBrain

Ecosystem and tooling for the MegaBrain autonomous orchestration framework and Model Context Protocol (MCP) integrations.

## Ecosystem: `@megabrain/cli`

`@megabrain/cli` provides CLI capabilities, orchestration primitives, and developer tooling for interfacing with MegaBrain autonomous agents and Model Context Protocol (MCP) servers.

### Key Capabilities

- **MCP Integration**: Connect and interact with MegaBrain Model Context Protocol services.
- **Workflow Orchestration**: Direct task scheduling, DAG decomposition, and execution telemetry.
- **Agent Interoperability**: Standardized protocol layer across development harnesses and coding agents.

### Installation

Public registry install is not claimed. Use a local preview tarball after packing this tree, then verify the binary version.

```bash
# Preview only. Does not prove public registry availability.
npm pack
npm install -g ./megabrain-cli-3.2.0.tgz
megabrain --version
```

### Usage

```bash
megabrain --help
```

## Sub-Skills Matrix

| Sub-Skill | Escopo & Capacidades |
| :--- | :--- |
| `megabrain-orchestrate` | Missões soberanas, swarm coordination, checkpoints |
| `megabrain-pipeline` | Decomposição DAG, ondas topológicas, auto-healing |
| `megabrain-review` | Revisão dual-blind, anti-slop lint, voice calibration |
| `megabrain-audit` | Merkle ledger, Ed25519 receipts, time-travel replay |
| `megabrain-context` | AST slicing, OpenAPI 3.1 contract synthesis, pacotes <3k tokens |
| `megabrain-ui` | Visual TDD headless, auditoria DOM, WCAG 2.1 e design tokens |

## Local Tooling Scripts

- `dag_validator.js`: acyclicity and waves (`node scripts/dag_validator.js tasks.json`)
- `merkle_verify.js`: local SHA-256 chain only, not Ed25519 (`node scripts/merkle_verify.js ledger.json`)
- `ast_slice.js`: local regex outline; not server Python AST (`node scripts/ast_slice.js src/app.js`)
- `wcag_check.js`: local JSON/flags contrast and target size; not CSS headless (`node scripts/wcag_check.js --fg="#ffffff" --bg="#111827" --width=44 --height=44`)

