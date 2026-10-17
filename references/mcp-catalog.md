# MegaBrain MCP Catalog (37 Canonical Tools)

The MegaBrain native Model Context Protocol (MCP) server provides 37 tools supporting dual naming conventions: dot notation (`megabrain.<tool>`) and underscore notation (`megabrain_<tool>`).

Transport: FastMCP Streamable HTTP (`POST /mcp`, `Accept: application/json, text/event-stream`).
Authentication: `Authorization: Bearer <token>` from `reports/auth/.current_orchestrator_token`.

---

## 1. System & Health Tools
- `megabrain.health`: Verifies operational health, core engine status, model registries, attestation status, and ledger state. Takes no parameters.
- `megabrain.inspect`: Inspects historical mission execution, task status, or cryptographic receipts. Requires at least one parameter: `mission_id`, `execution_id`, or `receipt_id`. Fail-closed on `{}`.
- `megabrain.inspect_work`: Detailed WorkRecord state inspection, cryptographic event DAG, and checkpoints.
- `megabrain.get_mission_scorecard`: Consolidates executive mission scorecard covering task completion, timing, and security gates.

## 2. Planning, Decomposition & Routing
- `megabrain.refine_prompt`: Converts raw prompts into executable contracts with explicit allowlists and acceptance criteria.
- `megabrain.decompose`: Decomposes tasks into structured SubTasks, validates DAG acyclicity via Kahn topological ordering, and builds parallel execution waves.
- `megabrain.get_parallel_waves`: Partitions DAG tasks into sequential waves of mutually independent, concurrent tasks.
- `megabrain.recommend`: Analyzes instructions to recommend optimal role, provider, and model without consuming generation tokens.
- `megabrain.optimize_pipeline_routing`: Optimizes model routing across topological waves honoring cost, capability, and latency bounds.

## 3. Subtask Execution & Verification
- `megabrain.dispatch_subtask`: Prepares and dispatches minimal ephemeral context packages for worker subagents.
- `megabrain.verify_subtask`: Validates execution results against deterministic GREEN gates (`status == 'GREEN'` and `exit_code == 0`).
- `megabrain.synthesize_subtask`: Dynamically synthesizes and injects corrective healing subtasks into the active DAG.
- `megabrain.heal_dependency_graph`: Diagnoses graph blockages, injects healing subtasks, and preserves topological integrity.
- `megabrain.grant_approval`: Explicit human/orchestrator approval for tasks in `WAITING_APPROVAL` state.

## 4. Pipeline Execution & State Recovery
- `megabrain.execute_pipeline`: Executes the sovereign orchestrator pipeline across topological waves with automatic caching and retry.
- `megabrain.resume_pipeline`: Resumes an interrupted DAG pipeline from its last valid checkpoint.
- `megabrain.create_checkpoint`: Creates an immutable state checkpoint for a WorkRecord.
- `megabrain.rollback_checkpoint`: Rolls back WorkRecord state and subtasks to a previously verified checkpoint.
- `megabrain.time_travel_replay`: Replays event logs sequentially, verifying cryptographic hash chains.

## 5. Security, Attestation & Ledgers
- `megabrain.export_evidence_pack`: Exports complete evidence pack with summary, SHA-256 chained logs, and Ed25519 signature.
- `megabrain.export_audit_ledger`: Exports cryptographically verifiable Merkle audit ledger for a mission.
- `megabrain.evaluate_execution_canary`: Evaluates structural, type, and output divergence across executions.
- `megabrain.arbitrate_concurrency`: Arbitrates shared and exclusive resource locks across concurrent agents.
- `megabrain.megabrain_adjudicate_consensus`: Cross-evaluates independent reviewers computing consensus score and conflict surfaces.

## 6. Frontend, UI & Accessibility Tools
- `megabrain.dom_audit`: Audits DOM structure for semantic hierarchy, image alt attributes, and WCAG accessibility compliance.
- `megabrain.css_validator`: Validates CSS syntax, unclosed braces, and property sanity.
- `megabrain.design_tokens`: Provides canonical dark mode tokens or validates CSS conformance.
- `megabrain.playwright_capture`: Captures headless browser rendering, screenshot base64, and console logs.
- `megabrain.summarize_visual_tdd`: Runs headless visual, layout, and WCAG accessibility regression audits.

## 7. Content, Copywriting & Code Analysis
- `megabrain.anti_slop_lint`: Scans text against humanizer anti-AI slop patterns and corporate cliches.
- `megabrain.readability_score`: Computes structural rhythm, sentence length variation, and engagement index.
- `megabrain.voice_calibrate`: Compares generated text against author samples for stylistic resonance.
- `megabrain.slice_ast_context`: Virtualizes context by slicing AST nodes and extracting essential symbols.
- `megabrain.synthesize_backend_contract`: Auto-synthesizes strict OpenAPI 3.1 contracts with schemas.
- `megabrain.coordinate_mission_swarm`: Coordinates autonomous multi-agent swarm unifying DAG planning, routing, and attestation.
- `megabrain.orchestrate`: Executes an end-to-end sovereign engineering mission in an isolated worktree.
- `megabrain.infer`: Cognitive delegation tool (deprecated under strict `MEGABRAIN_KERNEL_ONLY=1`).
