---
name: megabrain-context
version: "3.2.0"
description: "Virtualize codebase context via AST slicing, extract minimal packages (<3k tokens), and synthesize strict OpenAPI 3.1 contracts."
allowed-tools: ["mcp__megabrain__*", "terminal"]
---

# MegaBrain Context

Virtualize codebase context via AST slicing, assemble minimal context packages (<3k tokens), and synthesize strict OpenAPI 3.1 contracts via MegaBrain MCP.

## When to Use

- Virtualizing codebase context via structural AST slicing (`slice_ast_context`).
- Extracting surgical, minimal context packages (<3k tokens) for subtasks (`dispatch_subtask`).
- Synthesizing strict OpenAPI 3.1 backend contracts and mock fixtures (`synthesize_backend_contract`).
- Performing fast offline AST outline extraction via `scripts/ast_slice.js`.

## NOT for

- End-to-end sovereign mission orchestration or swarm checkpoints (`megabrain-orchestrate`).
- DAG task decomposition, topological waves, or graph healing (`megabrain-pipeline`).
- Headless visual TDD, CSS validation, or WCAG accessibility audits (`megabrain-ui`).

## Workflow & CLI

Execute via `megabrain call` or `npx @megabrain/cli call`:

```bash
# 1. Virtualize source context via AST slicing
megabrain call slice_ast_context '{"source_id": "api.ts", "language": "ts", "source_code": "export interface User { id: string; }"}'

# 2. Extract offline AST outlines locally
node scripts/ast_slice.js src/server.ts --json

# 3. Assemble and dispatch minimal subtask context package (<3k tokens)
megabrain call dispatch_subtask '{"work_id": "wrk_01", "task_id": "tsk_01"}'

# 4. Synthesize strict OpenAPI 3.1 backend contract
megabrain call synthesize_backend_contract '{"operation_id": "getUser", "path": "/users/{id}", "method": "get"}'
```

## Context Minification & Contract Invariants

- **Context Ceiling**: Keep dispatched context under 3k tokens; strip routine implementations and retain signatures only.
- **Strict OpenAPI 3.1**: Enforce `additionalProperties: false` on inputs and outputs to prevent untyped schema drift.
- **Deterministic Fixtures**: Seed contract mocks deterministically to guarantee reproducible integration testing.

## References

- AST virtualization specification: [references/ast-virtualization.md](references/ast-virtualization.md)
- OpenAPI contract synthesis specification: [references/openapi-contract-synthesis.md](references/openapi-contract-synthesis.md)
