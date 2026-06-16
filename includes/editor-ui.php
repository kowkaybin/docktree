<?php
if (!defined('ABSPATH')) exit;
?>

<div id="docktree-workspace">
    <!-- Action control layer -->
    <div class="docktree-toolbar">
        <div class="dt-toolbar-left">
            <button type="button" id="dt-refresh-btn" class="button button-primary">
                <span class="dashicons dashicons-update"></span> Refresh Viewport
            </button>

            <button type="button" id="dt-sidebar-toggle" class="button">
                <span class="dashicons dashicons-fullscreen-alt"></span> Toggle Sidebar Focus
            </button>

            <label class="dt-toggle-label">
                <input type="checkbox" id="dt-shortcode-toggle" checked />
                <span>Execute Shortcodes</span>
            </label>
        </div>

        <div class="dt-toolbar-right">
            <span class="dt-status-msg" id="dt-runtime-status">Docktree Sandbox Active</span>
            <button type="button" id="dt-save-page-btn" class="button button-primary">
                <span class="dashicons dashicons-saved"></span> <span id="dt-save-label">Save Page</span>
            </button>
            <button type="button" id="dt-preview-page-btn" class="button">
                <span class="dashicons dashicons-visibility"></span> Preview Changes
            </button>
        </div>
    </div>

    <!-- The Side-by-Side Split Grid Panels -->
    <div class="docktree-split-container">
        <!-- Left Workspace Pane: Tree Panel -->
        <div class="docktree-panel docktree-editor-pane" id="dt-left-panel">
            <div class="panel-header">
                <strong>Tree Panel</strong>

                <!-- 3-Mode View Tab Selector -->
                <div class="dt-panel-tabs">
                    <button type="button" class="dt-tab-btn" data-tab="html">HTML</button>
                    <button type="button" class="dt-tab-btn" data-tab="tree">Tree</button>
                    <button type="button" class="dt-tab-btn" data-tab="layout">Layout</button>
                </div>
            </div>

            <!-- Tab View Contents -->
            <div class="dt-tab-content-wrapper">
                <!-- Tab 1: HTML Raw View -->
                <div class="dt-tab-view" id="dt-view-html">
                    <div class="dt-html-toolbar">
                        <button type="button" class="button button-small" id="dt-insert-image-btn">
                            <span class="dashicons dashicons-format-image"></span> Insert Image
                        </button>
                    </div>
                    <textarea name="docktree-shadow-textarea" id="docktree-shadow-textarea" rows="25" placeholder="Type Bootstrap HTML or structures here..."></textarea>
                </div>

                <!-- Tab 2: Nestable Tree View -->
                <div class="dt-tab-view" id="dt-view-tree">
                    <div class="tree-actions-toolbar">
                        <button type="button" class="button button-small" id="dt-tree-add-row">
                            <span class="dashicons dashicons-plus"></span> Add Row
                        </button>
                    </div>

                    <!-- Bulk Styling Toolbar (shown when ≥2 nodes selected) -->
                    <div id="dt-bulk-toolbar" style="display:none;">
                        <div class="dt-bulk-header">
                            <span id="dt-bulk-count-badge" class="dt-bulk-badge">0 selected</span>
                            <button type="button" id="dt-bulk-clear-btn" class="dt-tree-action-btn" title="Clear Selection">
                                <span class="dashicons dashicons-no-alt"></span>
                            </button>
                        </div>
                        <div class="dt-bulk-row">
                            <input type="text" id="dt-bulk-add-class-input" class="dt-bulk-input" placeholder="Add class(es)..." />
                            <button type="button" id="dt-bulk-add-class-btn" class="button button-small dt-bulk-btn" title="Add classes to selected">+</button>
                        </div>
                        <div class="dt-bulk-row">
                            <input type="text" id="dt-bulk-remove-class-input" class="dt-bulk-input" placeholder="Remove class(es)..." />
                            <button type="button" id="dt-bulk-remove-class-btn" class="button button-small dt-bulk-btn" title="Remove classes from selected">−</button>
                        </div>
                        <div class="dt-bulk-row">
                            <input type="text" id="dt-bulk-replace-from-input" class="dt-bulk-input" placeholder="From class..." />
                            <span class="dt-bulk-arrow">→</span>
                            <input type="text" id="dt-bulk-replace-to-input" class="dt-bulk-input" placeholder="To class..." />
                            <button type="button" id="dt-bulk-replace-class-btn" class="button button-small dt-bulk-btn" title="Replace class token">⇄</button>
                        </div>
                        <div class="dt-bulk-row">
                            <input type="text" id="dt-bulk-style-prop-input" class="dt-bulk-input dt-bulk-prop" placeholder="CSS prop" />
                            <span class="dt-bulk-colon">:</span>
                            <input type="text" id="dt-bulk-style-val-input" class="dt-bulk-input dt-bulk-val" placeholder="value" />
                            <button type="button" id="dt-bulk-set-style-btn" class="button button-small dt-bulk-btn" title="Apply inline style">Set</button>
                        </div>
                        <div class="dt-bulk-row dt-bulk-style-row">
                            <button type="button" id="dt-bulk-copy-style-btn" class="button button-small">
                                <span class="dashicons dashicons-admin-appearance"></span> Copy Style
                            </button>
                            <button type="button" id="dt-bulk-paste-style-btn" class="button button-small" disabled>
                                <span class="dashicons dashicons-editor-paste"></span> Paste Style
                            </button>
                        </div>
                    </div>

                    <div class="tree-navigation-container">
                        <ul id="dt-tree-root" class="dt-tree-list"></ul>
                    </div>
                </div>

                <!-- Tab 3: Abstract Layout View -->
                <div class="dt-tab-view" id="dt-view-layout">
                    <div class="layout-visualizer-info">
                        <span class="dashicons dashicons-info"></span> Drag elements to update structure. Click blocks to sync scroll tracking.
                    </div>
                    <div class="layout-visualizer-container" id="dt-layout-diagram-root"></div>
                </div>
            </div>
        </div>

        <!-- Interactive Drag Resizer Bar Splitter -->
        <div id="docktree-resizer"></div>

        <!-- Right Workspace Pane: Viewport -->
        <div class="docktree-panel docktree-preview-pane" id="dt-right-panel">
            <div class="panel-header viewport-header">
                <strong>Viewport</strong>

                <div class="zoom-controls">
                    <button type="button" class="button button-small dt-zoom-btn active" data-zoom="1">100%</button>
                    <button type="button" class="button button-small dt-zoom-btn" data-zoom="0.75">75%</button>
                    <button type="button" class="button button-small dt-zoom-btn" data-zoom="0.5">50%</button>
                    <button type="button" class="button button-small dt-zoom-btn" data-zoom="responsive">Fit Container</button>
                </div>
            </div>

            <div class="iframe-container-mask">
                <div class="iframe-wrapper" id="dt-iframe-zoom-wrapper">
                    <iframe id="docktree-preview-frame" src="about:blank"></iframe>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Node Global Options Menu Popup Template -->
<div id="dt-context-menu" class="dt-dropdown-menu" style="display:none;">
    <ul>
        <li><button type="button" class="dt-context-action" data-action="copy"><span class="dashicons dashicons-admin-page"></span> Copy Node</button></li>
        <li><button type="button" class="dt-context-action" data-action="copy-style"><span class="dashicons dashicons-admin-appearance"></span> Copy Style</button></li>
        <li><button type="button" class="dt-context-action" data-action="paste-style" disabled><span class="dashicons dashicons-editor-paste"></span> Paste Style</button></li>
        <li><button type="button" class="dt-context-action" data-action="duplicate"><span class="dashicons dashicons-images-alt2"></span> Duplicate</button></li>
        <li><button type="button" class="dt-context-action" data-action="paste"><span class="dashicons dashicons-editor-paste"></span> Paste Clipboard</button></li>
        <li class="divider"></li>
        <li><button type="button" class="dt-context-action text-danger" data-action="delete"><span class="dashicons dashicons-trash"></span> Delete Element</button></li>
    </ul>
</div>

<!-- Universal Adder Column Node Dialog Menu -->
<div id="dt-universal-add-menu" class="dt-dropdown-menu" style="display:none; min-width: 190px;">
    <div class="dt-menu-section-title">Add Layout Component</div>
    <ul>
        <li><button type="button" class="dt-add-action-item" data-type="row"><span class="dashicons dashicons-menu-alt" style="color:#2563eb;"></span> Nested Grid Row</button></li>
        <li class="divider"></li>
    </ul>
    <div class="dt-menu-section-title">Components Marketplace</div>
    <div class="dt-menu-search-wrapper">
        <input type="text" id="dt-widget-search-input" placeholder="Search widget type..." autocomplete="off" />
    </div>
    <ul id="dt-widget-options-list" class="dt-menu-scroll-list">
        <li><button type="button" class="dt-add-action-item" data-type="widget" data-widget="text"><span class="dashicons dashicons-editor-paragraph"></span> Rich Text Block</button></li>
        <li><button type="button" class="dt-add-action-item" data-type="widget" data-widget="banner"><span class="dashicons dashicons-format-image"></span> Image Banner</button></li>
        <li><button type="button" class="dt-add-action-item" data-type="widget" data-widget="button"><span class="dashicons dashicons-admin-links"></span> Action Button</button></li>
        <li><button type="button" class="dt-add-action-item" data-type="widget" data-widget="card"><span class="dashicons dashicons-welcome-widgets-menus"></span> Content Card</button></li>
        <li><button type="button" class="dt-add-action-item" data-type="widget" data-widget="spacer"><span class="dashicons dashicons-editor-expand"></span> Layout Spacer</button></li>
        <li><button type="button" class="dt-add-action-item" data-type="widget" data-widget="template"><span class="dashicons dashicons-editor-code"></span> Template Processor</button></li>
    </ul>
</div>

<!-- Super Modal Master Target Box -->
<div id="dt-universal-editor-dialog" style="display:none;"></div>

<!-- Copy Style Picker Dialog -->
<div id="dt-copy-style-dialog" class="dt-modal-overlay" style="display:none;">
    <div class="dt-copy-style-modal">
        <div class="dt-csd-header">
            <h3>Copy Style from &ldquo;<span id="dt-csd-node-label">Node</span>&rdquo;</h3>
            <button type="button" id="dt-csd-cancel-btn" class="dt-tree-action-btn" title="Cancel">
                <span class="dashicons dashicons-no-alt"></span>
            </button>
        </div>
        <div class="dt-csd-body">
            <div class="dt-csd-col">
                <div class="dt-csd-col-header">
                    <strong>CSS Classes</strong>
                    <label><input type="checkbox" id="dt-csd-toggle-all-classes" checked /> All</label>
                </div>
                <div id="dt-csd-classes-list" class="dt-csd-checklist"></div>
            </div>
            <div class="dt-csd-col">
                <div class="dt-csd-col-header">
                    <strong>Inline Styles</strong>
                    <label><input type="checkbox" id="dt-csd-toggle-all-styles" checked /> All</label>
                </div>
                <div id="dt-csd-styles-list" class="dt-csd-checklist"></div>
            </div>
        </div>
        <div class="dt-csd-footer">
            <button type="button" id="dt-csd-cancel2-btn" class="button">Cancel</button>
            <button type="button" id="dt-csd-confirm-btn" class="button button-primary">Copy Selected</button>
        </div>
    </div>
</div>