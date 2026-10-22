---
name: megabrain-ui
version: "3.2.0"
description: "Execute headless visual TDD, validate CSS against design tokens, and audit WCAG 2.1 accessibility and target sizing."
allowed-tools: ["mcp__megabrain__*", "terminal"]
---

# MegaBrain UI

Execute headless visual TDD, validate CSS against design tokens, and audit WCAG 2.1 accessibility via MegaBrain MCP.

## When to Use

- Executing headless visual test-driven development (TDD) cycles (`playwright_capture`, `summarize_visual_tdd`).
- Auditing DOM structure for semantic hierarchy, landmark roles, and accessible labels (`dom_audit`).
- Validating CSS syntax, brace balance, and property hygiene (`css_validator`).
- Enforcing semantic design token conformance and detecting raw hex/rgb drift (`design_tokens`).
- Auditing color contrast and touch target sizing compliance offline via `scripts/wcag_check.js`.

## NOT for

- End-to-end sovereign mission orchestration or swarm checkpoints (`megabrain-orchestrate`).
- DAG task decomposition, topological waves, or dependency auto-healing (`megabrain-pipeline`).
- Cryptographic Merkle audit ledgers, Ed25519 receipts, or time-travel replay (`megabrain-audit`).
- Multi-reviewer consensus, anti-slop linting, or voice calibration (`megabrain-review`).

## Workflow & CLI

Execute via `megabrain call` or `npx @megabrain/cli call`:

```bash
# 1. Capture headless browser rendering and visual bounding boxes
megabrain call playwright_capture '{"url": "http://localhost:3000", "viewport": {"width": 1280, "height": 800}}'

# 2. Summarize visual TDD results and assert zero violations
megabrain call summarize_visual_tdd '{"html": "index.html", "css": "styles.css"}'

# 3. Audit DOM hierarchy and accessibility landmarks
megabrain call dom_audit '{"html": "index.html"}'

# 4. Validate CSS syntax integrity and design token alignment
megabrain call css_validator '{"css_content": "@import \"theme.css\"; .btn { color: var(--primary); }"}'
megabrain call design_tokens '{"validate": true, "css_path": "styles/theme.css"}'

# 5. Check WCAG 2.1 AA contrast and 44x44px touch targets locally
node scripts/wcag_check.js --fg="#ffffff" --bg="#111827" --width=44 --height=44
```

## Visual Gates & WCAG Compliance

- **Visual TDD Gate**: Require zero violations (`violations_count == 0`, `status == "pass"`) before green verification.
- **Contrast & Sizing Standards**: Enforce WCAG 2.1 AA contrast (>= 4.5:1 text, >= 3.0:1 large) and >= 44x44px targets.
- **Token Invariance**: Strictly forbid undeclared raw hex/rgb color literals outside canonical root design tokens.

## References

- Visual TDD methodology: [references/visual-tdd-methodology.md](references/visual-tdd-methodology.md)
- WCAG target sizes & accessibility: [references/wcag-target-sizes.md](references/wcag-target-sizes.md)
- Design tokens specification: [references/design-tokens-spec.md](references/design-tokens-spec.md)
