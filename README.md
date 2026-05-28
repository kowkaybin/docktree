# Docktree 🌳

**A lightweight, Bootstrap-native layout builder for WordPress — where your HTML is the database.**

No serialized JSON. No database bloat. No lock-in. Just clean Bootstrap markup that you can read, edit, and version-control like any other code.

![Docktree Editor Preview](assets/images/preview.gif)

---

## Why Docktree?

Most WordPress page builders store your layout as serialized JSON or base64 blobs in the database. That means vendor lock-in, import/export headaches, and markup you can't read or diff.

Docktree takes the opposite approach: **the HTML in the post content field is the layout**. The editor reads it, lets you manipulate it visually, and writes clean Bootstrap HTML back. Nothing else.

| | Docktree | Elementor / Gutenberg |
|---|---|---|
| Layout storage | Raw Bootstrap HTML | Serialized JSON / block markup |
| Database bloat | None | Significant |
| Bootstrap compatibility | Native | Requires workarounds |
| Version control friendly | Yes — diff your layouts | No — binary blobs |
| Plugin dependency | Removable | Content breaks without it |
| Learning curve | Standard Bootstrap | Proprietary block system |

---

## What it does

**Split-panel IDE workspace**
A resizable left panel (tree view, layout diagram, raw HTML) next to a live iframe preview of your page inside the active theme. Zoom to 50%, 75%, or full width.

**Tree view with drag-and-drop**
Your Bootstrap rows, columns, and widgets appear as a nested tree. Drag to reorder, double-click to edit, right-click for a context menu. Structure changes write back to HTML instantly.

**Multi-select and bulk styling**
Select multiple nodes with click / Ctrl+Click. A bulk toolbar appears letting you add, remove, or replace CSS class tokens and inline style properties across all selected nodes at once.

**Copy Style dialog**
Pick exactly which CSS classes and inline styles to copy from one node. Structural classes like `col-md-6` and `row` are pre-unchecked so you never accidentally overwrite layout. Paste additively to any selection.

**Widget component system**
Typed widgets (Text, Banner, Button, Card, Spacer) with a two-column property editor: left pane for component-specific fields, right pane for CSS classes, inline styles, and custom attributes on any node.

**Non-destructive tagging**
Docktree adds `data-dt-id` and `data-dt-type` tracking attributes on the fly. They stay out of your way, survive re-parses, and never alter your Bootstrap class structure.

**Async save**
"View Page" commits your layout via AJAX in the background before opening the frontend — your live preview is always in sync.

---

## Quick Start

```bash
cd wp-content/plugins
#git clone 
git clone --filter=blob:none --no-checkout <your-repo-url> && cd <your-repo-folder> && git config core.sparseCheckout true && echo "/*" > .git/info/sparse-checkout && echo "!/DEV/" >> .git/info/sparse-checkout && git checkout main

https://github.com/kowkaybin/docktree.git
```

1. Go to **WordPress Admin → Plugins** and activate **Docktree**
2. Create or edit any **Page** — Gutenberg is disabled automatically
3. The Docktree workspace opens in place of the editor

---

## Tech Stack

- **WordPress** — meta boxes, admin AJAX, plugin hooks
- **Vanilla JS + jQuery + jQuery UI** — no build step, no bundler
- **SortableJS** — drag-and-drop across nested levels
- **DOMParser API** — native browser HTML parsing, no dependencies
- **Bootstrap grid** — `.row` / `.col-*` classes recognized natively

---

## File Structure

```
docktree/
├── docktree.php                  # Plugin bootstrap, AJAX handlers, asset registration
├── includes/
│   └── editor-ui.php             # Editor workspace HTML, bulk toolbar, dialogs
├── templates/
│   └── preview-sandbox.php       # Theme-wrapped iframe canvas
└── assets/
    ├── css/
    │   ├── admin-style.css        # Workspace chrome: panels, tree view, toolbar, viewport
    │   └── widgets.css            # Modal dialogs and widget editor styles
    └── js/
        ├── editor.js              # Core engine: parser, tree, drag-drop, bulk operations
        └── widgets.js             # jQuery UI widget subclasses for each component type
```

---

## Roadmap

- **TinyMCE integration** — rich text editing inside the text widget instead of raw HTML
- **WordPress Media Library** — pick images from the media modal instead of typing URLs
- **Spacer slider** — drag a pixel ruler to set spacer height visually
- **More widget types** — expanding the Components Marketplace in `widgets.js`
