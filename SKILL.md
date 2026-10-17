---
name: megabrain-mcp-orchestration
description: "MegaBrain sovereign MCP orchestration and dev harness."
version: 2.0.0
author: Luiz Franco (LuizKarlos), Hermes Agent
license: MIT
platforms: [linux, macos]
metadata:
  hermes:
    tags: [megabrain, mcp, orchestration, cumulative, harness]
    related_skills: [agile-jev-orchestrator-loop, hermes-agent]
---

# MegaBrain Sovereign MCP Orchestration & Development Harness

## Overview
This skill governs the autonomous, verifiable orchestration of the **MegaBrain** sovereign platform via its native Model Context Protocol (MCP) server, multi-cycle cumulative development pipelines (`dev_mcp_v1` ... `dev_mcp_vN`), and fail-closed evidence sealing.

It incorporates all verified platform improvements through `dev_mcp_v4` (immutable delta identity, crash-atomic report publication, deterministic barrier concurrency, and directory-level fsync durability).

---

## When to Use
- Orchestrating tasks, audits, or pipelines through the running MegaBrain FastMCP server.
- Executing cumulative multi-cycle development iterations (`dev_mcp_v1` -> `dev_mcp_vN`).
- Running sealed test batteries, evidence collection, and two-track independent review loops.
- Do not use for: Direct ad-hoc edits on canonical repository `LuizKarlos/megabrain` without worktree isolation.

---

## Core Invariants & Governance

1. **Canonical Repository Protection (MANDATORY)**:
   - The canonical repository (`/srv/megabrain-dev/repository`, `LuizKarlos/megabrain`) is strictly read-only during development.
   - Opening PRs (`gh pr create`) or merging (`gh pr merge`) on `LuizKarlos/megabrain` is strictly forbidden without express, prior, and unambiguous authorization from the user in the chat for that specific action.
   - Development occurs exclusively in isolated Git worktrees and is published to replica repositories (`LuizKarlos/dev_mcp_v[k]`).

2. **Cumulative Chaining ($v_k \leftarrow v_{k-1}$)**:
   - Version 1 ($v_1$) branches strictly from canonical `main`.
   - Each subsequent version ($v_k, k > 1$) must branch directly from the preceding published replica (`dev_mcp_v[k-1]`). Never reset $v_k$ to canonical `main`.
   - Every replica inherits 100% of accumulated code, schemas, and test suites.

3. **FastMCP Transport & Single-Writer Mode**:
   - Endpoint: Streamable HTTP at `POST /mcp` with `Accept: application/json, text/event-stream`.
   - Streaming responses use SSE format (`data: {jsonrpc...}`). Clients must parse the `data: ` line.
   - Dev daemons run on port 20140 with:
     ```bash
     MEGABRAIN_PORT=20140 MEGABRAIN_LIVE_DEPLOYMENT=1 MEGABRAIN_SINGLE_WRITER_MODE=1 python3 scripts/run_mcp_server.py
     ```
   - Process longevity: Daemons and Cloudflare tunnels must be launched with `persist_on_release=true` and `background=true`.
   - Health vs. Ready:
     - `/health` returns HTTP 200 `{"status": "HEALTHY"}`.
     - In development workspaces lacking production release manifests, `/ready` returns HTTP 503 `{"errors": ["release_manifest_missing"]}`. This is normal and expected; the MCP tool `megabrain.health` returns `status: READY`.

4. **Authentication & Token Isolation**:
   - Operational auth token resides at `reports/auth/.current_orchestrator_token`.
   - Requests include `Authorization: Bearer <token>`.
   - Never commit `reports/auth/` to public git replicas. Never leak tokens or credentials in logs, diffs, or chat.

5. **Proven Reviewer & Storage Invariants (Cumulative v1–v4)**:
   - **v1**: Mandatory `delta_identity` (`base`, `head`, `diff_sha256`, `files_manifest`). Rejection if mismatch.
   - **v2**: Crash-atomic publication via `tempfile.mkstemp(dir=reports_dir)` -> `flush()` -> `os.fsync(fileno)` -> `os.link(temp, target)`. Guaranteed cleanup via `finally: os.unlink(temp)`. Winning reviewer model preservation on idempotent re-runs.
   - **v3**: Deterministic concurrency barrier testing (`Barrier(2)`), pre-publication failure containment, and certified stdout oracles (`TEMP_CLEANUP_ORACLE`, `CONCURRENT_LINK_ORACLE`).
   - **v4**: Directory durability: `descritor = os.open(reports_dir, os.O_RDONLY)` followed by `os.fsync(descritor)` and `finally: os.close(descritor)` immediately after successful `os.link`. Certified via `DIRECTORY_FSYNC_ORACLE`.

6. **Replica Publishing Safeguards**:
   - Always remove `.github/workflows/` before pushing replica repositories to avoid permission failures with tokens lacking the `workflow` scope.
   - Use `gh auth token` with basic HTTP authentication headers or set credentials explicitly.

---

## 37 Canonical MCP Tools

All tools are accessible via `megabrain.<tool>` and `megabrain_<tool>`. See `references/mcp-catalog.md` for complete schema details.

Essential orchestration workflows:
1. `megabrain.health`: Pre-flight operational readiness check.
2. `megabrain.refine_prompt`: Validates input and extracts strict file allowlists.
3. `megabrain.decompose`: Creates DAG `WorkRecord`, topological order, and parallel waves.
4. `megabrain.dispatch_subtask`: Prepares minimal ephemeral context bundle for workers.
5. `megabrain.verify_subtask`: Validates worker execution against strict GREEN gates.
6. `megabrain.export_evidence_pack`: Compiles verifiable cryptographic evidence.

---

## Agile Jev Delivery Loop

For each development unit/part:
1. **Preflight**: Jev selects bounded transition (`continue`, `change_approach`, etc.).
2. **Read-Only Triad**: Dispatch 3 parallel read-only subagents:
   - `PESQUISADOR_DE_PROBES`: identifies adversarial attack classes and invariants.
   - `INVENTARIADOR_DE_FIXTURES`: inventories existing tests, gaps, and reusable controls.
   - `PREPARADOR_DA_PRÓXIMA_SPRINT`: calculates line ranges, ceiling, and runner spec.
3. **Consolidation**: Orchestrator consolidates a single property card with explicit allowlist and ceiling.
4. **RED Stage**: Implementer writes failing test with observable stable stdout oracle. Operator runs spec via `scripts/operator_runner.py`. Observer certifies failure provenance.
5. **GREEN Stage**: Implementer applies minimal production fix. Operator runs focused spec. Observer certifies green test and stdout oracles.
6. **Final Battery**: Operator runs comprehensive gates (`diff --check`, `py_compile`, focused test, `scripts/ci_pr.py matrix`). Observer certifies all stages.
7. **Independent Review**: Designated reviewer model evaluates 100% of diff read-only with dual tracks:
   - **MVP/Harness Track**: `MVP_GO` or `MVP_NO_GO`.
   - **Hardening Track**: `SECURITY_GO` or `SECURITY_NO_GO`.
8. **Promotion & Telemetry**: Worktree is committed, replica is published, Cloudflare tunnel verified, and issue is commented.

---

## Mandatory Pipeline Report Format

Pipeline updates must conform strictly to the 4-topic format (max 5 lines, no introductory or concluding filler):

```text
[Esteira Issue #<N> | Parte <X>/<Y> | Etapa <E>/12]
- Fazendo isso, fazemos: <capacidade inaugurada ou objetivo direto>
- Corrigido: <o que acabou de ser resolvido no ciclo>
- Auditor avaliou: <vereditos MVP_GO/SECURITY_GO e status CI>
- Implementador vai trabalhar: <próxima etapa objetiva>
```

---

## Verification
To verify compliance with this skill:
1. Confirm replica is cumulative from $v_{k-1}$ (`git log` shows inherited commits).
2. Confirm `.github/workflows` is absent before push.
3. Confirm sealed operator logs (`.log` and `.done.json`) exist with matching `TEST_ID`.
4. Confirm independent reviewer output contains dual verdicts and 100% delta coverage.
5. Confirm no uncommitted or modified files exist on canonical repository `/srv/megabrain-dev/repository`.
