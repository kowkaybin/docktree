# Docktree — Claude Context

## What This Project Is

An extremely lean WordPress plugin that gives developers and content editors structured control over page layout, styling, and content — without the bloat of Gutenberg or Elementor.

It sits in the balance between raw HTML and a full WYSIWYG: it brings scope, boundary, structure, and convenience while keeping the final DOM output as lean as possible.

**Two audiences:**
- **Developers / designers** — proficient with HTML + CSS, comfortable with CSS variables, want full control without fighting a framework
- **Content editors** — navigate to the correct block and edit only the allowed fields, without fear of breaking the layout

## Project Vision

1. A framework that manages scope and boundary between rudimentary HTML and bloated WYSIWYG
2. Growing library of primitive widgets
3. Template processor widget ecosystem — predefined, reusable component templates
4. Long-term: MCP interface for AI agents to manage layout design, content editing, and publishing with high automation

## Environment

- WordPress with a minimalist theme
- Plugin lives at: `docktree.php`

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Backend | PHP (WP plugin) | |
| Frontend logic | Vanilla JS | No arrow functions — use `function` keyword for readability |
| DOM manipulation | jQuery | No new jQuery UI dependencies |
| Styling | Bootstrap 5 | Layout and utility classes |
| Icons | FontAwesome 5 | Available at runtime |

**Runtime available in browser:** jQuery, jQuery UI (legacy — existing widgets use it, don't add new UI widget dependencies), Bootstrap 5, FontAwesome 5

## File Structure

```
docktree.php                  ← plugin entry, REST API routes, WP hooks
includes/editor-ui.php        ← editor panel HTML markup
assets/js/editor.js           ← core workspace logic (tree, vDOM, drag/drop, context menu)
assets/js/widgets.js          ← jQuery UI widget definitions (node editors)
assets/js/widgets-js          ← component runtime SDK (DocktreeComponent sandbox)
assets/css/admin-style.css    ← workspace chrome only (panels, toolbar, tree, bulk bar)
assets/css/widgets.css        ← all modal and dialog styles
```

**CSS rule:** Widget/modal styles → `widgets.css`. Workspace/editor chrome → `admin-style.css`. Never mix.

## Branch Strategy

- `main` — stable, release-only. Never commit directly.
- `clauding` — active development branch. All work goes here, PRs to main.

```bash
# Start of session
git checkout clauding && git pull origin clauding
```

## Coding Conventions

- **No arrow functions** — use `function` keyword for readability
- **No comments** unless the WHY is genuinely non-obvious
- **No jQuery UI** for new code — existing widgets.js uses it, don't extend that pattern
- **No bloat** — every addition must justify its weight; lean output is a core principle
- **CSS variables** are encouraged for theming

## Key Architecture Notes

- `getCustomAttributesString($el)` returns ALL attributes including internal `data-dt-*` — callers must filter what they show users
- Internal `data-dt-*` attributes (`data-dt-type`, `data-dt-widget`, `data-dt-id`, `data-dt-label`, `data-dt-tpl`, `data-dt-js`, `data-dt-json`) are never shown to users in the editor UI
- Template processor reads `data-dt-tpl/js/json` from `attrsVal` string (not directly from DOM) — keep this intact when cleaning display fields
- `admin-style.css` and `widgets.css` are separate by design — do not consolidate
- `commitWorkspace($vDom)` is the single write point for all DOM mutations — always call this after bulk operations, never write to the textarea directly
