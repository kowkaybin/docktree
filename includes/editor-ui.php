<?php if (!defined('ABSPATH')) exit; ?>

<div id="docktree-workspace">
    <!-- Action control layer -->
    <div class="docktree-toolbar">
        <div class="dt-toolbar-left">
            <button type="button" id="dt-refresh-btn" class="button button-primary">
                <span class="dashicons dashicons-update"></span> Refresh Viewport
            </button>

            <!-- Focus Mode Sidebar Toggle -->
            <button type="button" id="dt-sidebar-toggle" class="button">
                <span class="dashicons dashicons-fullscreen-alt"></span> Toggle Sidebar Focus
            </button>

            <!-- Dynamic Shortcode Processing Option -->
            <label class="dt-toggle-label">
                <input type="checkbox" id="dt-shortcode-toggle" checked />
                <span>Execute Shortcodes</span>
            </label>
        </div>

        <div class="dt-toolbar-right">
            <span class="dt-status-msg">Docktree Sandbox Active</span>

            <!-- Contextual Save/Preview Lifecycle Control Buttons -->
            <button type="button" id="dt-save-page-btn" class="button button-primary">
                <span class="dashicons dashicons-saved"></span> Save Page
            </button>
            <button type="button" id="dt-preview-page-btn" class="button">
                <span class="dashicons dashicons-visibility"></span> View Page
            </button>
        </div>
    </div>

    <!-- The Side-by-Side Split Grid Panels -->
    <div class="docktree-split-container">
        <!-- Left Workspace Pane: Tree Panel -->
        <div class="docktree-panel docktree-editor-pane" id="dt-left-panel">
            <div class="panel-header">
                <strong>Tree Panel</strong>
                <span class="panel-subtitle">Raw DOM Editor</span>
            </div>
            <textarea name="docktree-shadow-textarea" id="docktree-shadow-textarea" rows="25" placeholder="Type Bootstrap HTML or elements here..."></textarea>
        </div>

        <!-- Interactive Drag Resizer Bar Splitter -->
        <div id="docktree-resizer"></div>

        <!-- Right Workspace Pane: Viewport -->
        <div class="docktree-panel docktree-preview-pane" id="dt-right-panel">
            <div class="panel-header viewport-header">
                <strong>Viewport</strong>

                <!-- Scaling Responsive Mechanics -->
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