/**
 * Author: Kay Bin (vibe Gemini 20260521)
 * Modular jQuery UI Widgets for Docktree Node Configurations
 */
(function($) {
    // ==========================================
    // REUSABLE BASE JQUERY UI WIDGET: nodeEditorBase (SiteOrigin 2-Column Split)
    // ==========================================
    $.widget("docktree.nodeEditorBase", {
        options: {
            nodeId: null,
            title: "Editor",
            onSave: null
        },
        _create: function() {
            this.element.addClass("dt-universal-editor-container");
            this._buildModalMarkup();
            this._bindEvents();
        },
        _buildModalMarkup: function() {
            this.element.empty().append(`
                <div class="dt-modal-overlay">
                    <div class="dt-modal-content">
                        <div class="dt-modal-header">
                            <div class="dt-modal-header-title-area">
                                <h3 class="dt-modal-title-text">${this.options.title}</h3>
                                <span class="dt-modal-label-display" title="Click to edit label">(Unlabeled)</span>
                                <input type="text" id="dt-universal-label" class="dt-modal-label-input" style="display:none;" placeholder="Enter custom label..." />
                            </div>
                            <button type="button" class="dt-modal-close-trigger dt-tree-action-btn"><span class="dashicons dashicons-no"></span></button>
                        </div>
                        <div class="dt-modal-body">
                            <!-- Left Spacious Content Pane -->
                            <div class="dt-modal-body-left">
                                <div class="dt-subclass-fields"></div>
                            </div>

                            <!-- Right Styling/Options Sidebar -->
                            <div class="dt-modal-body-right">
                                <div class="dt-form-group">
                                    <label>Custom CSS Classes</label>
                                    <input type="text" id="dt-universal-class" class="dt-form-input" placeholder="e.g. shadow-sm my-3 col-md-6" />
                                </div>
                                <div class="dt-form-group">
                                    <label>Inline Style Rules (CSS)</label>
                                    <textarea id="dt-universal-style" class="dt-form-textarea" rows="4" placeholder="color: red;&#10;margin-top: 10px;"></textarea>
                                </div>
                                <div class="dt-form-group">
                                    <label>Custom HTML DOM Attributes</label>
                                    <textarea id="dt-universal-attrs" class="dt-form-textarea" rows="3" placeholder="e.g. data-aos=&quot;fade-up&quot;&#10;id=&quot;custom-id&quot;"></textarea>
                                </div>
                            </div>
                        </div>
                        <div class="dt-modal-footer">
                            <div class="dt-modal-footer-left">
                                <!-- Base prev/next navigation added globally to all node editors -->
                                <button type="button" class="button dt-btn-modal-prev" title="Previous Node (Global)"><span class="dashicons dashicons-arrow-left-alt2" style="margin-top:3px;"></span></button>
                                <button type="button" class="button dt-btn-modal-next" title="Next Node (Global)"><span class="dashicons dashicons-arrow-right-alt2" style="margin-top:3px;"></span></button>
                            </div>
                            <div class="dt-modal-footer-right">
                                <button type="button" class="button dt-btn-modal-cancel">Cancel</button>
                                <div class="dt-split-button-container">
                                    <button type="button" class="button button-primary dt-btn-modal-save" style="border-top-right-radius:0; border-bottom-right-radius:0; border-right:1px solid rgba(255,255,255,0.2);">Save Changes</button>
                                    <button type="button" class="button button-primary dt-btn-modal-save-next" title="Save & Edit Next (Ctrl+Enter)" style="border-top-left-radius:0; border-bottom-left-radius:0; padding-left:8px; padding-right:8px; display:flex; align-items:center;">
                                        <span class="dashicons dashicons-arrow-right-alt" style="font-size:16px; width:16px; height:16px; margin:0;"></span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `);
        },
        _bindEvents: function() {
            const self = this;
            const ns = ".nodeEditorBase";

            // Clean up any surviving event handlers bound in previous runs
            this.element.off(ns);

            this.element.on('click' + ns, '.dt-modal-label-display', function(e) {
                e.preventDefault(); e.stopPropagation();
                const currentVal = $(this).text() === '(Unlabeled)' ? '' : $(this).text();
                self.element.find('.dt-modal-label-display').hide();
                self.element.find('#dt-universal-label').val(currentVal).show().focus();
            });

            this.element.on('blur' + ns, '#dt-universal-label', function() {
                const val = $(this).val().trim();
                self.element.find('#dt-universal-label').hide();
                self.element.find('.dt-modal-label-display').text(val || '(Unlabeled)').show();
            });

            this.element.on('keydown' + ns, '#dt-universal-label', function(e) {
                if (e.keyCode === 13) {
                    e.preventDefault();
                    $(this).blur();
                }
            });

            this.element.on('click' + ns, '.dt-modal-close-trigger, .dt-btn-modal-cancel', function(e) {
                e.preventDefault(); e.stopPropagation();
                self.close();
            });

            this.element.on('click' + ns, '.dt-btn-modal-save', function(e) {
                e.preventDefault(); e.stopPropagation();
                self._save(false);
            });

            this.element.on('click' + ns, '.dt-btn-modal-save-next', function(e) {
                e.preventDefault(); e.stopPropagation();
                self._save(true, 'next');
            });

            this.element.on('click' + ns, '.dt-btn-modal-prev', function(e) {
                e.preventDefault(); e.stopPropagation();
                self._save(true, 'prev');
            });

            this.element.on('click' + ns, '.dt-btn-modal-next', function(e) {
                e.preventDefault(); e.stopPropagation();
                self._save(true, 'next');
            });

            this.element.on('keydown' + ns, function(e) {
                if (e.keyCode === 13 && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault(); e.stopPropagation();
                    self._save(true, 'next');
                }
            });
        },
        open: function(nodeId, labelVal, classVal, styleVal, attrsVal) {
            this.options.nodeId = nodeId;
            this.element.find('.dt-modal-label-display').text(labelVal || '(Unlabeled)').show();
            this.element.find('#dt-universal-label').hide().val(labelVal || '');
            this.element.find('#dt-universal-class').val(classVal || '');
            this.element.find('#dt-universal-style').val(styleVal || '');
            this.element.find('#dt-universal-attrs').val(attrsVal || '');

            const $content = this.element.find('.dt-modal-content');
            $content.removeClass('dt-anim-slide-left dt-anim-slide-right');
            if (window.dtModalAnimClass) {
                const el = $content[0];
                if (el) {
                    el.style.animation = 'none';
                    el.offsetHeight; // trigger layout reflow
                    el.style.animation = null;
                }
                $content.addClass(window.dtModalAnimClass);
                window.dtModalAnimClass = '';
            }

            this.element.show();

            const self = this;
            let $docs = $(document);
            const iframe = $('#docktree-preview-frame')[0];
            if (iframe && iframe.contentWindow) {
                try { $docs = $docs.add(iframe.contentWindow.document); } catch (err) {}
            }

            $docs.off('keydown.dtModalClose').on('keydown.dtModalClose', function(e) {
                if (e.keyCode === 27) {
                    e.preventDefault();
                    self.close();
                }
            });
        },
        close: function() {
            this.element.hide();
            let $docs = $(document);
            const iframe = $('#docktree-preview-frame')[0];
            if (iframe && iframe.contentWindow) {
                try { $docs = $docs.add(iframe.contentWindow.document); } catch (err) {}
            }
            $docs.off('keydown.dtModalClose');
        },
        _save: function(goToNext, direction) {
            if (typeof this.options.onSave === "function") {
                const baseData = {
                    nodeId: this.options.nodeId,
                    label: this.element.find('#dt-universal-label').val().trim() || (this.element.find('.dt-modal-label-display').text() === '(Unlabeled)' ? '' : this.element.find('.dt-modal-label-display').text().trim()),
                    classes: this.element.find('#dt-universal-class').val().trim(),
                    style: this.element.find('#dt-universal-style').val().trim(),
                    attrs: this.element.find('#dt-universal-attrs').val().trim()
                };
                this.options.onSave(baseData, this._getSubclassData(), goToNext, direction);
            }
            this.close();
        },
        _getSubclassData: function() {
            return {};
        },
        _destroy: function() {
            // Explicitly clean up all namespaced events from persistent wrapper element
            this.element.off(".nodeEditorBase");
            this.element.removeClass("dt-universal-editor-container").empty();
        }
    });

    // ==========================================
    // ROW EDITOR WIDGET SUBCLASS
    // ==========================================
    $.widget("docktree.rowEditor", $.docktree.nodeEditorBase, {
        options: { title: "Grid Row Configuration" },
        _create: function() {
            this._super();
            this.element.find('.dt-subclass-fields').append(`
                <div class="dt-form-group">
                    <label>Bootstrap Gutter Spacing</label>
                    <select id="dt-row-gutter" class="dt-form-select">
                        <option value="g-0">g-0 (No Gutter)</option>
                        <option value="g-1">g-1 (4px)</option>
                        <option value="g-2">g-2 (8px)</option>
                        <option value="g-3" selected>g-3 (16px)</option>
                        <option value="g-4">g-4 (24px)</option>
                        <option value="g-5">g-5 (48px)</option>
                    </select>
                </div>
            `);
        },
        open: function(nodeId, labelVal, classVal, styleVal, gutterVal, attrsVal) {
            this._super(nodeId, labelVal, classVal, styleVal, attrsVal);
            this.element.find('#dt-row-gutter').val(gutterVal || 'g-3');
            this.element.find('.dt-modal-title-text').text(this.options.title);
        },
        _getSubclassData: function() {
            return {
                gutter: this.element.find('#dt-row-gutter').val()
            };
        }
    });

    // ==========================================
    // COLUMN EDITOR WIDGET SUBCLASS
    // ==========================================
    $.widget("docktree.columnEditor", $.docktree.nodeEditorBase, {
        options: { title: "Grid Cell Layout Configuration" },
        _create: function() {
            this._super();
            this.element.find('.dt-subclass-fields').append(`
                <div style="background: #f1f5f9; padding: 15px; border-radius: 4px; font-size: 13px; color: #475569;">
                    <strong>Responsive Design Guidance:</strong><br/>
                    Specify responsive cell widths directly inside the <span style="font-family: monospace;">CUSTOM CSS CLASSES</span> right panel input field (e.g., <span style="font-family: monospace;">col-md-6 col-lg-4 col-12</span>). This allows clean, uncompromised style alignment.
                </div>
            `);
        },
        open: function(nodeId, labelVal, classVal, styleVal, attrsVal) {
            this._super(nodeId, labelVal, classVal, styleVal, attrsVal);
            this.element.find('.dt-modal-title-text').text(this.options.title);
        }
    });

    // ==========================================
    // BASE WIDGET EDITOR SUBCLASS
    // ==========================================
    $.widget("docktree.widgetEditor", $.docktree.nodeEditorBase, {
        options: { title: "Base Component Settings", widgetName: "text" },
        _create: function() {
            this._super();
            this.element.find('.dt-subclass-fields').append(`
                <div class="dt-form-group">
                    <label>HTML Markup Payload</label>
                    <textarea id="dt-widget-content" class="dt-form-textarea" rows="12" placeholder="Type markup content..."></textarea>
                </div>
            `);
        },
        open: function(nodeId, labelVal, classVal, styleVal, nameVal, contentVal, attrsVal) {
            this._super(nodeId, labelVal, classVal, styleVal, attrsVal);
            this.options.widgetName = nameVal || 'text';
            this.element.find('#dt-widget-content').val(contentVal || '');
            this.element.find('.dt-modal-title-text').text(this.options.title);
        },
        _getSubclassData: function() {
            return {
                name: this.options.widgetName,
                content: this.element.find('#dt-widget-content').val()
            };
        }
    });

    // ==========================================
    // INHERITED WIDGETS SPECIFIC SUBCLASSES
    // ==========================================
    $.widget("docktree.widgetEditorText", $.docktree.widgetEditor, {
        options: { title: "Text Component Settings" }
    });

    $.widget("docktree.widgetEditorImage", $.docktree.widgetEditor, {
        options: { title: "Image Component Settings" },
        _create: function() {
            this._super();
            this.element.find('.dt-subclass-fields').prepend(`
                <div class="dt-form-group" style="margin-bottom: 12px;">
                    <label>Image Source URL</label>
                    <input type="text" id="dt-img-src" class="dt-form-input" placeholder="https://example.com/image.jpg" />
                </div>
            `);
        },
        open: function(nodeId, labelVal, classVal, styleVal, nameVal, contentVal, attrsVal) {
            this._super(nodeId, labelVal, classVal, styleVal, nameVal, contentVal, attrsVal);
            const $tempDom = $('<div>' + contentVal + '</div>');
            const imgSrc = $tempDom.find('img').attr('src') || '';
            this.element.find('#dt-img-src').val(imgSrc);
        },
        _getSubclassData: function() {
            const baseData = this._super();
            const imgSrc = this.element.find('#dt-img-src').val().trim();
            if (imgSrc) {
                baseData.content = `<div class="text-center"><img src="${imgSrc}" class="img-fluid rounded" alt="banner" /></div>`;
            }
            return baseData;
        }
    });
})(jQuery);