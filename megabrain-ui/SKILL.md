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

Execute via `megabrain call` com nome qualificado e JSON objeto. O parser rejeita JSON que não seja objeto.

```bash
# 1. Captura headless com fixture permitida e PNG. Sem URL remota/SSRF.
megabrain call megabrain.playwright_capture '{"html_content":"<button>Ok</button>","viewport":{"width":1280,"height":800}}'

# 2. Visual TDD usa html_content real, não path html/css.
megabrain call megabrain.summarize_visual_tdd '{"html_content":"<main><h1>Ok</h1></main>"}'

# 3. DOM audit com html_content.
megabrain call megabrain.dom_audit '{"html_content":"<main><h1>Ok</h1></main>"}'

# 4. CSS validator com css_content. design_tokens usa action + css_content, não validate nem path de CSS.
megabrain call megabrain.css_validator '{"css_content":".btn { color: var(--primary); }"}'
megabrain call megabrain.design_tokens '{"action":"validate","css_content":":root { --primary: #111827; } .btn { color: var(--primary); }"}'

# 5. wcag_check.js local aceita JSON/flags. Não é CSS headless. JSON inválido falha fechado.
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
