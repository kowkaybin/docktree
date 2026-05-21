# Docktree

**Docktree** is a lightweight, opinionated, developer-centric layout engine for WordPress that treats the raw DOM as the absolute single source of truth. 

Unlike traditional, consumer-grade page builders that sacrifice speed for non-technical abstractions, Docktree is explicitly built for power users, engineers, and designers who want maximum layout control with minimal UI friction. It eliminates endless clicking, heavy configuration sidebars, and nested wrapper bloat, outputting pure, high-performance HTML directly to your database.

---

## 🚀 The Core Philosophy

1. **DOM as the Single Source of Truth:** No secondary layout JSON tables, no complex shortcode maps, and no proprietary data structures. The HTML content *is* the configuration.
2. **Minimal Clicks, Maximum Code Control:** Visually manipulate responsive layouts structurally while keeping raw markup and utility classes completely pure.
3. **Zero Frontend Performance Footprint:** Docktree operates entirely within the WordPress admin lifecycle. On the live frontend, your pages load as native, semantic, lightning-fast HTML layout strings.

---

## ✨ Features (Phase 1)

- **Isolated Viewport Sandbox:** A completely separate `<iframe>` environment that loads your active theme's headers, styles, and footers while isolating your workspace content from Gutenberg canvas styles.
- **Dual-Panel Workspace Architecture:** - **Tree Panel (Left):** Raw structural input text area configured to a lightning-fast 25% default width layout upon initialization.
  - **Viewport (Right):** A fluid, highly interactive rendering canvas with automated browser scale matrix transforms.
- **Interactive Panel Splitter:** A smooth, custom vertical drag handler bar that lets you resize your code panel and preview pane layout on the fly.
- **On-Demand Shortcode Execution:** A dedicated toolbar toggle switch that routes content through an asynchronous WordPress AJAX parsing bridge only when explicitly enabled, preserving memory.
- **Persistent Focus Mode:** Click to hide the native WordPress admin sidebar clutter and expand your engineering dashboard to 100% full screen. Your focus state preference is automatically remembered across page loads using local browser storage.
- **Integrated Lifecycle Controls:** Save Page and View Page actions are mapped directly onto the custom editor toolbar for rapid testing loops.
- **Gutenberg Intercept:** Cleanly disables the block editor system for standard pages, loading an efficient, custom workspace dashboard directly beneath the page title.

---

## 🗺️ Project Roadmap

Docktree is being engineered in three distinct, methodical phases:

### Phase 1: The Core Pipeline 🛠️ *(Current State)*
Establishing a rock-solid, zero-bloat pipeline matching raw textual layout input with an interactive frame viewport without theme layout script interference.

### Phase 2: The Structural UI (Tree Layout Engine) 🌳 *(Upcoming)*
Replacing the raw structural textarea with an interactive, folder-style visual tree mapping layout hierarchy. Moving a node reorders rows or columns horizontally and vertically, natively regenerating data-attribute serialized strings instantly behind the scenes.

### Phase 3: The Component Engine (Custom Widget Ecosystem) 🧩
Introducing a parameterized widget engine. Developers write clean base HTML blueprints with custom identifiers (e.g., `data-dt-config='{...}'`). The UI interprets the configuration fields, while the inner layout acts as a completely disposable, self-healing compiled payload cached for public frontend delivery.

---

## 🛠️ Installation

1. Download or clone this repository directly into your WordPress plugin environment:
   ```bash
   cd wp-content/plugins/
   git clone
