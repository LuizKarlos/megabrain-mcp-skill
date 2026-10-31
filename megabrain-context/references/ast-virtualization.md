# AST Context Virtualization Specification

Governs context virtualization and AST pruning via `@megabrain/cli` and MegaBrain MCP (`https://mcp.atlascommand.dev/mcp`).

## Context Virtualization Principles (`megabrain_slice_ast_context`)

Virtualizes source files into structural outlines to prevent token bloat during agent dispatch:
- **Surgical Token Reduction**: Compresses source footprints from 50k+ tokens to <3k tokens per context package.
- **Structural Signature Extraction**: Preserves type definitions, interfaces, function signatures, and exported classes.
- **Implementation Body Discard**: Strips routine implementation blocks (`{ ... }`), internal loops, and private helpers.
- **Polyglot Parsing Support**: Handles JavaScript, TypeScript, and Python signatures deterministically.

## Execution via MCP and Local CLI (`scripts/ast_slice.js`)

Context slicing runs both server-side via MCP and locally via CLI utilities:
- **Local AST Slicer (`scripts/ast_slice.js`)**: Fast outline generation without remote RPC latency.
- **MCP Context Virtualizer (`megabrain_slice_ast_context`)**: Extracts fine-grained AST nodes and declarations on demand.
- **Selective Dispatch**: Injects only structural outlines into prompt context, fetching full implementations on demand.

```bash
node scripts/ast_slice.js src/service.ts
megabrain call megabrain.slice_ast_context '{"source_code":"class Foo: pass","language":"python","target_name":"Foo"}'
```

scripts/ast_slice.js é outline local limitado e preserva contratos de interface TypeScript. `megabrain.slice_ast_context` é AST Python no servidor. Sem flags `--json`. Sem prometer <3k tokens sem medir.
