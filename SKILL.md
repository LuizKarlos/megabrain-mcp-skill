---
name: megabrain
description: "MegaBrain Sovereign Model Context Protocol (MCP) Orchestration Skill for AI harnesses and coding agents."
version: 3.1.0
license: MIT
platforms: [linux, macos, windows]
metadata:
  tags: [mcp, orchestration, autonomous-agent, dag-pipeline, code-review]
---

# MegaBrain Sovereign MCP Orchestration Skill

## Overview
This skill guides autonomous coding agents and AI assistants on how to connect to and interact with the **MegaBrain** Model Context Protocol (MCP) service.

MegaBrain provides an enterprise-grade orchestration core featuring DAG task decomposition, topological wave execution, automated verification test gates, AST context virtualization, and multi-reviewer consensus adjudication.

---

## Connecting to MegaBrain MCP

### 1. Transport & Protocols
MegaBrain supports streamable HTTP (and Server-Sent Events / SSE) over standard HTTP/HTTPS:
- **Default Endpoint**: `POST /mcp` (e.g. `https://mcp.atlascommand.dev/mcp` or your self-hosted host).
- **Headers**:
  - `Content-Type: application/json`
  - `Accept: application/json, text/event-stream`
  - `Authorization: Bearer <SEU_TOKEN_MCP>`

### 2. Tool Naming
All MegaBrain tools are exposed via canonical dot notation: `megabrain.<tool>` (e.g. `megabrain.health`, `megabrain.decompose`, `megabrain.execute_pipeline`).

---

## Core Orchestration Workflow

When orchestrating complex features, refactoring, or multi-step engineering tasks, follow this sequence:

### Step 1: Pre-flight Health Check
Verify server availability, readiness, and active tool capabilities.
- **Tool**: `megabrain.health`
- **Arguments**: `{}`
- **Expected Output**: Status `READY` or `HEALTHY`.

### Step 2: Contract & Requirement Refinement
Transform unstructured user requests into formal execution contracts with clear file allowlists and acceptance criteria.
- **Tool**: `megabrain.refine_prompt`
- **Arguments**:
  - `prompt` (string, required): The user task or engineering objective.
  - `context` (string | object | array, optional, default: `null`): Background technical context.
  - `risk_level` (string, optional, default: `"HIGH"`): Assessed risk level (`"LOW"`, `"MEDIUM"`, `"HIGH"`).
- **Outcome**: Bounded contract with explicit scopes and execution constraints.

### Step 3: DAG Task Decomposition
Decompose the objective into an acyclic directed graph (DAG) of atomic, verifiable subtasks.
- **Tool**: `megabrain.decompose`
- **Arguments**:
  - `prompt` (string, required): The high-level engineering goal.
  - `tasks` (array of objects, optional, default: `null`): Explicit initial task specifications.
  - `work_id` (string, optional, default: `null`): Pre-allocated WorkRecord identifier.
  - `title` (string, optional, default: `null`): Short descriptive title for the mission.
  - `metadata` (object, optional, default: `null`): Additional mission metadata.
- **Outcome**: A `WorkRecord` containing topological waves of mutually independent tasks.

### Step 4: Ephemeral Subtask Dispatch
Prepare minimal, isolated context packages for each ready subtask.
- **Tool**: `megabrain.dispatch_subtask`
- **Arguments**:
  - `work_id` (string, required): Active WorkRecord identifier.
  - `task_id` (string, required): Target subtask identifier.
  - `allowed_scope` (object, optional, default: `null`): Scoped boundary definitions.
- **Outcome**: Ephemeral context bundle containing only the relevant code slices and requirements.

### Step 5: Subtask Verification Gate
Validate worker outputs against strict deterministic verification criteria before accepting changes.
- **Tool**: `megabrain.verify_subtask`
- **Arguments**:
  - `work_id` (string, required): Active WorkRecord identifier.
  - `task_id` (string, required): Executed subtask identifier.
  - `test_result` (object, optional, default: `null`): Structured verification output or test execution report.
- **Outcome**: Verification receipt confirming green status.

### Step 6: Pipeline Execution & Topological Traversal
Execute or step through DAG waves sequentially while running ready tasks within each wave in parallel.
- **Tool**: `megabrain.execute_pipeline`
- **Arguments**:
  - `work_id` (string, required): Active WorkRecord identifier.
  - `test_commands` (object, optional, default: `null`): Structured map of test commands.
  - `max_remediations` (integer, optional, default: `2`): Maximum automatic healing attempts.
  - `progress_token` (string | integer, optional, default: `null`): Progress reporting identifier.
  - `auto_heal` (boolean, optional, default: `false`): Whether to inject healing subtasks on failure.
  - `optimize_routing` (boolean, optional, default: `false`): Optimize model routing across waves.
  - `reviewer_evaluations` (object, optional, default: `null`): Evaluations from review gates.
- **Outcome**: Progress notifications and execution receipts per wave.

### Step 7: Multi-Reviewer Consensus Adjudication
For critical changes, run independent adversarial reviews and compute weighted consensus.
- **Tool**: `megabrain.adjudicate_consensus`
- **Arguments**:
  - `task_id` (string, required): Target task under review.
  - `reviews` (array of objects, optional, default: `null`): Independent review verdicts and findings.
  - `work_id` (string, optional, default: `null`): Associated WorkRecord identifier.
- **Outcome**: Consolidated verdict (`MVP_GO` / `MVP_NO_GO`, `SECURITY_GO` / `SECURITY_NO_GO`).

### Step 8: Cryptographic Evidence Export
Generate an audit trail of the entire execution.
- **Tool**: `megabrain.export_evidence_pack`
- **Arguments**:
  - `work_id` (string, required): Completed WorkRecord identifier.
- **Outcome**: Verifiable audit ledger and evidence summary.

---

## Specialized Quality & Analysis Tools

MegaBrain provides domain-specific utilities to enhance code quality and user experience:

- `megabrain.dom_audit`:
  Audits HTML markup for semantic hierarchy (`h1` -> `h2` -> `h3`), image alt attributes, interactive element affordances, and WCAG 2.1 AA accessibility compliance.
  - Arguments:
    - `html_content` (string, optional, default: `null`): Raw HTML markup to audit.
    - `url` (string, optional, default: `null`): Web address to audit.
    - `standard` (string, optional, default: `"wcag2aa"`): Compliance standard.

- `megabrain.css_validator`:
  Validates stylesheet syntax, unclosed braces, vendor prefix sanity, and layout integrity.
  - Arguments:
    - `css_content` (string, optional, default: `null`): CSS stylesheet content.
    - `file_path` (string, optional, default: `null`): File path to audit.

- `megabrain.anti_slop_lint`:
  Scans generated copy and user-facing messages against artificial AI cliché patterns, robotic transition phrases, and empty filler to ensure humanized communication.
  - Arguments:
    - `text` (string, required): Text to scan and humanize.

- `megabrain.slice_ast_context`:
  Extracts precise AST subtrees and call graphs for targeted functions or classes, preventing context bloat.
  - Arguments:
    - `source_code` (string, optional, default: `null`): Source code content.
    - `target_name` (string, optional, default: `null`): Identifier of function or class to extract.
    - `node_type` (string, optional, default: `null`): Target AST node type filter.
    - `source` (string, optional, default: `null`): Raw code or file path.
    - `source_id` (string, optional, default: `"source_file.py"`): File name label.
    - `language` (string, optional, default: `"python"`): Target programming language.
    - `selectors` (array of strings, optional, default: `null`): Specific AST selector queries.
    - `history_store_id` (string, optional, default: `null`): Context cache store reference.

- `megabrain.arbitrate_concurrency`:
  Manages shared and exclusive resource locks across concurrent agents with Lamport logical clocks and TTL leases.
  - Arguments:
    - `action` (string, optional, enum: `["acquire", "release", "inspect", "renew"]`, default: `"inspect"`): Lease operation.
    - `workspace_id` (string, optional, default: `"default_workspace"`): Workspace partition identifier.
    - `agent_id` (string, optional, default: `null`): Requesting agent identifier.
    - `mode` (string, optional, default: `"SHARED"`): Locking mode (`"SHARED"` or `"EXCLUSIVE"`).
    - `paths` (array of strings, optional, default: `null`): Resource paths to lock.
    - `lease_id` (string, optional, default: `null`): Active lease identifier for release or renewal.
    - `operation_id` (string, optional, default: `null`): Correlation identifier.
    - `ttl_seconds` (number, optional, default: `null`): Lease lifetime duration.

---

## Best Practices for AI Agents

1. **Fail-Closed Verification**:
   Never assume an edit or patch succeeded without validating against a concrete test or DOM/CSS audit. If a gate fails, halt and diagnose rather than proceeding blindly.

2. **Context Economy**:
   Use `megabrain.slice_ast_context` and minimal ephemeral context bundles rather than loading full repositories into the prompt.

3. **Safe State Rollbacks**:
   Create a checkpoint (`megabrain.create_checkpoint`) before major refactoring or multi-file operations. If unexpected regressions occur, use `megabrain.rollback_checkpoint`.

4. **Secret Hygiene**:
   Pass authentication tokens via standard HTTP Authorization headers or environment variables. Never print tokens, credentials, or keys in conversation messages, logs, or committed files.
