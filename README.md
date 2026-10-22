# MegaBrain

Ecosystem and tooling for the MegaBrain autonomous orchestration framework and Model Context Protocol (MCP) integrations.

## Ecosystem: `@megabrain/cli`

`@megabrain/cli` provides CLI capabilities, orchestration primitives, and developer tooling for interfacing with MegaBrain autonomous agents and Model Context Protocol (MCP) servers.

### Key Capabilities

- **MCP Integration**: Connect and interact with MegaBrain Model Context Protocol services.
- **Workflow Orchestration**: Direct task scheduling, DAG decomposition, and execution telemetry.
- **Agent Interoperability**: Standardized protocol layer across development harnesses and coding agents.

### Installation

```bash
npm install -g @megabrain/cli
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

- `dag_validator.js`: Validação de aciclicidade DAG e cálculo de ondas (`node scripts/dag_validator.js tasks.json`)
- `merkle_verify.js`: Verificação determinística de integridade do Merkle ledger (`node scripts/merkle_verify.js ledger.json`)
- `ast_slice.js`: Fatiamento semântico de AST e redução de contexto (`node scripts/ast_slice.js src/app.js`)
- `wcag_check.js`: Auditoria headless de contraste e conformidade WCAG 2.1 (`node scripts/wcag_check.js style.css`)

