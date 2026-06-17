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
docktree.php                  ← plugin entry, AJAX handlers, WP hooks
includes/editor-ui.php        ← editor panel HTML markup
assets/js/editor.js           ← core workspace logic (tree, vDOM, drag/drop, context menu, HTML mode)
assets/js/widgets.js          ← jQuery UI widget definitions (node editors)
assets/js/component-runtime.js ← component runtime SDK (DocktreeComponent sandbox)
assets/css/admin-style.css    ← workspace chrome only (panels, toolbar, tree, bulk bar)
assets/css/widgets.css        ← all modal and dialog styles
templates/preview-sandbox.php ← full-page preview window (get_header/footer + canvas-root + window.opener inject)
```

**CSS rule:** Widget/modal styles → `widgets.css`. Workspace/editor chrome → `admin-style.css`. Never mix.

## Branch Strategy

Single branch — all work goes directly on `main`.

```bash
# Start of session
git checkout main && git pull origin main
```

To add a custom post type to the Docktree editor, use the filter in your theme's `functions.php`:
```php
add_filter('docktree_post_types', function($types) {
    $types[] = 'my_custom_type';
    return $types;
});
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
- `prepareContentBeforeSave()` (user-defined in page) is the single sync point called before all save/preview operations — ensures TinyMCE content is flushed to `#content` textarea
- `positionDropdown($menu, btn)` — use for all floating menus; uses `position: fixed` + `getBoundingClientRect()` + viewport clamping to avoid scroll-offset issues
- `treeModeAllowed()` — returns true when textarea is blank OR contains `data-dt-type`; gates Tree/Layout tabs
- `enforceModeForContent()` — call after any textarea value change; updates tab disabled states and convert button visibility

## HTML Edit Mode (Tab: HTML)

When the HTML tab is active:
- The preview iframe's `#docktree-canvas-root` becomes `contenteditable="true"` with a green dashed outline
- `input.dtEdit` event on the canvas syncs `innerHTML` back to `$dtTextarea` and `$wpTextarea`
- `selectionchange.dtSync` event maps selected text in the iframe to the shadow textarea via `indexOf` + `setSelectionRange` (inactive highlight, no focus steal); debounced 80ms
- Shortcode/block expansion is skipped in HTML mode to preserve lossless round-trip
- `setPreviewEditable(enabled)` manages all of the above — call it when switching tabs

## HTML Tab Toolbar Buttons

- **Insert Image** (`#dt-insert-image-btn`) — opens `wp.media` frame with `displaySettings: true` (size selector). On select: builds `<figure class="wp-block-image"><img .../>[<figcaption>]</figure>`, inserts at saved iframe cursor position or appends. Requires `wp_enqueue_media()` in PHP (already called).
- **Convert to Tree Mode** (`#dt-convert-btn`) — visible only when content is non-empty raw HTML (no `data-dt-type`). Runs `dtFlattenWrappers` pre-pass then `dtConvertContainer`, switches to Tree tab.

## HTML → Docktree Conversion Functions

All live in `editor.js` in the `// HTML → DOCKTREE TREE CONVERSION` section:

| Function | Purpose |
|---|---|
| `hasMeaningfulClasses(el)` | Returns true if element has Bootstrap utility/grid classes — those divs are kept |
| `shouldUnwrap(el)` | True for single-child divs with no style/meaningful classes — pure passthrough wrappers |
| `dtFlattenWrappers(container, depth)` | Post-order pre-pass; unwraps passthrough divs recursively; depth cap 50 |
| `dtIsRow(el)` / `dtIsCol(el)` | Detects Bootstrap `.row` and `.col-*` elements |
| `dtMakeWidget(content)` | Creates `<div class="dt-widget" data-dt-type="widget" data-dt-widget="text">` wrapper |
| `dtTagRow(el, depth)` / `dtTagCol(el, depth)` | Tags matched elements with `data-dt-type` and `data-dt-id`; depth cap 20 |
| `dtConvertContainer(container, depth)` | Main walker; groups non-row elements into `row g-3 > col-md-12 > widget` |

Widget HTML structure (for reference):
```html
<div class="dt-widget" data-dt-type="widget" data-dt-widget="text" data-dt-id="dt-node-N">
    <div class="dt-widget-render">...content...</div>
</div>
```

## Save / Preview Flow

- `#dt-save-page-btn` — AJAX save via `docktree_save_post_async`; saves `post_content`, `post_title`, `post_name`; clears WP dirty state
- `#dt-preview-page-btn` — calls `prepareContentBeforeSave()` then triggers `#post-preview` (WP native preview in new tab)
- `#publish` / `#save-post` — `prepareContentBeforeSave()` is called first to flush Docktree textarea into `#content`
- Preview window (`templates/preview-sandbox.php`) — opened via `window.open`; injects `window.opener.dtPreviewContent` into `#docktree-canvas-root`

## AJAX Endpoints

| Action | Handler | Purpose |
|---|---|---|
| `docktree_save_post_async` | `docktree_save_post_async_callback` | Saves content, title, slug via `wp_update_post` |
| `docktree_parse_content` | `docktree_parse_content_ajax` | Runs `do_blocks` + optional `do_shortcode`; returns rendered HTML |

## docktreeData (JS global, localized from PHP)

```javascript
docktreeData.ajaxUrl      // admin-ajax.php URL
docktreeData.postId       // current post ID
docktreeData.saveNonce    // nonce for save action
docktreeData.postStatus   // 'publish', 'draft', etc.
docktreeData.previewUrl   // ?docktree_preview=1 URL (legacy — preview-sandbox approach now preferred)
```

