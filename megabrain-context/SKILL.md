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

Execute via `megabrain call` com nome qualificado e JSON objeto. O parser rejeita JSON que não seja objeto.

```bash
# 1. AST Python no servidor. Não é o outline local.
megabrain call megabrain.slice_ast_context '{"source_code":"def foo():\n    return 1","language":"python","target_name":"foo"}'

# 2. ast_slice.js é outline local limitado (regex). Preserva interface TypeScript; não é AST semântico.
# Sem flags de JSON. Mock/parser não é prova live. Sem prometer <3k tokens sem medir.
node scripts/ast_slice.js src/server.ts

# 3. Dispatch com scope explícito. work_id/task_id reais já criados.
megabrain call megabrain.dispatch_subtask '{"work_id":"work_local_1","task_id":"t1","allowed_scope":{"files":["src/server.ts"],"read_only":true}}'

# 4. OpenAPI 3.1 com JSON objeto, não flags.
megabrain call megabrain.synthesize_backend_contract '{"operation_id":"getUser","path":"/users/{id}","method":"get"}'
```

## Context Minification & Contract Invariants

- **Context Ceiling**: Outline local e AST servidor são evidências diferentes. Não prometer teto de tokens sem medir o dispatch real.
- **Strict OpenAPI 3.1**: Enforce `additionalProperties: false` on inputs and outputs to prevent untyped schema drift.
- **Deterministic Fixtures**: Seed contract mocks deterministically to guarantee reproducible integration testing.

## References

- AST virtualization specification: [references/ast-virtualization.md](references/ast-virtualization.md)
- OpenAPI contract synthesis specification: [references/openapi-contract-synthesis.md](references/openapi-contract-synthesis.md)
