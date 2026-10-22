# OpenAPI 3.1 Contract Synthesis Specification

Governs automatic backend contract synthesis and API drift prevention via `@megabrain/cli` and MegaBrain MCP (`https://mcp.atlascommand.dev/mcp`).

## Strict OpenAPI 3.1 Synthesis (`megabrain_synthesize_backend_contract`)

Generates strict REST API contracts to anchor frontend and backend implementations before coding:
- **Mechanical Contract Synthesis**: Auto-generates OpenAPI 3.1 schema definitions from operation signatures.
- **Strict Schema Constraints**: Enforces `additionalProperties: false` on inputs and outputs to prevent untyped leakage.
- **Deterministic Fixtures**: Produces reproducible request/response mocks seeded for deterministic testing.
- **Explicit Route Mapping**: Couples HTTP methods, path parameters, and status codes to operation IDs.

## Schema Validation & Drift Prevention

Prevents integration regressions across decoupled client-server development cycles:
- **JSON Schema Validation**: Mechanically validates payloads against input and output schemas.
- **Strict Data Typing**: Disallows ambiguous types (`any`, `object` without properties) across endpoint boundaries.
- **Drift Invariance**: Serves as single source of truth; tests fail immediately when contracts diverge.

```bash
megabrain call synthesize_backend_contract --operation_id "getUser" --path "/api/v1/users/{id}" --method "get"
```
