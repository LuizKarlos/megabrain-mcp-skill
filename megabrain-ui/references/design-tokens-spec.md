# Design Tokens Specification & CSS Validation

Governs semantic design token architecture and CSS conformance validation via `@megabrain/cli` and MegaBrain MCP (`https://mcp.atlascommand.dev/mcp`).

## Canonical Token Architecture (`megabrain_design_tokens`)

Centralizes interface variables into semantic, theme-agnostic tokens:
- **Palette**: Surface (`--bg`, `--surface`, `--surface-2`), text (`--text`, `--text-muted`), accent (`--primary`, `--accent`), status (`--danger`, `--success`).
- **Typography**: Fluid scale scales (`--font-sans`, `--font-mono`, `--text-sm`, `--text-base`, `--text-lg`, `--line-height-normal`).
- **Spacing & Elevation**: Consistent intervals (`--space-1` through `--space-8`), radii (`--radius-sm`, `--radius-md`), shadows (`--shadow-sm`, `--shadow-lg`).
- **Strict Prohibition**: Hardcoded hex/rgb values outside root token declarations are strictly forbidden.

## CSS Conformance & Linting (`megabrain_css_validator`)

- **Syntax & Nesting Integrity**: Verifies balanced braces, valid media queries, and correct pseudo-selector syntax.
- **Token Drift Auditing**: Mechanically scans CSS stylesheets for undeclared color literals and broken CSS variable references.
- **Fail-Closed Validation**: Rejects stylesheets containing unclosed blocks or unmapped design tokens.

```bash
megabrain call design_tokens --validate --css_path "src/styles/theme.css"
megabrain call css_validator --css_content "@import 'theme.css'; .btn { color: var(--primary); }"
```
