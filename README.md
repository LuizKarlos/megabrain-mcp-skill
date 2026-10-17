# MegaBrain MCP Orchestration Skill

Canonical, version-controlled skill and development harness for sovereign **MegaBrain** MCP orchestration, cumulative multi-cycle delivery pipelines, and fail-closed attestation.

## Contents
- `SKILL.md`: The operational skill specification compatible with Hermes Agent and autonomous cognitive harnesses.
- `scripts/operator_runner.py`: Reusable, fail-fast operator runner generating sealed `.log` and `.done.json` execution receipts.
- `references/mcp-catalog.md`: Exhaustive reference of all 37 canonical MegaBrain MCP tools, signatures, and contracts.
- `references/cumulative-evolution-v1-v4.md`: Detailed audit of architectural improvements accumulated across `dev_mcp_v1` through `dev_mcp_v4`.

## Installation into Hermes
To install this skill into your active Hermes profile:
```bash
mkdir -p ~/.hermes/skills/megabrain
cp -r . ~/.hermes/skills/megabrain/megabrain-mcp-orchestration
```

## Governance
- **Canonical Repo Protection**: All work runs in ephemeral worktrees. Pull Requests or Merges on `LuizKarlos/megabrain` require explicit, prior chat authorization.
- **Cumulative Chaining**: Every evolution version $v_k$ strictly inherits from $v_{k-1}$.
- **Dual-Track Review**: Fail-closed separation between runtime-critical MVP requirements and non-blocking hardening debts.
