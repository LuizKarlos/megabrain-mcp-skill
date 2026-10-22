# WCAG Target Sizes & Accessibility Specification

Governs touch target sizing and color contrast verification for WCAG 2.1 AA/AAA compliance via `@megabrain/cli` and MegaBrain MCP (`https://mcp.atlascommand.dev/mcp`).

## Target Size Compliance (WCAG 2.1 SC 2.5.5 & SC 2.5.8)

Ensures interactive elements are easily operable across touch and pointer devices:
- **Minimum Target Size**: All interactive elements (`<button>`, `<a>`, `<input>`, touch controls) require minimum $44 \times 44\text{px}$ footprint.
- **Padding Compensation**: Sub-44px elements must expand interactive hit-areas using transparent borders or tap padding.
- **Spacing Invariance**: Adjacent interactive targets must maintain at least $8\text{px}$ separation to eliminate accidental activation.

## Contrast & Focus Rings

- **Normal Text Contrast (SC 1.4.3)**: Relative luminance ratio $\ge 4.5:1$ against resolved background for text under 18pt (or 14pt bold).
- **Large Text Contrast**: Ratio $\ge 3.0:1$ for text $\ge 18\text{pt}$ (or $\ge 14\text{pt}$ bold) and graphical UI components.
- **Visible Focus Rings (SC 2.4.7)**: Unbroken focus indicators (`outline: 2px solid var(--focus-ring)`) with $\ge 3.0:1$ contrast against adjacent pixels.

```bash
node scripts/wcag_check.js --fg="#ffffff" --bg="#111827" --width=44 --height=44
node scripts/wcag_check.js --fg="#fca5a5" --bg="#7f1d1d" --json
```
