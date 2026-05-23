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
                            <div class="dt-modal-body-left">
                                <div class="dt-subclass-fields"></div>
                            </div>
                            <div class="dt-modal-resizer" title="Drag to resize panels"></div>
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
                if ($(e.target).closest('#dt-tpl-pane-data').length) return; 

                if (e.keyCode === 13 && (e.ctrlKey || e.metaKey)) {
                    e.preventDefault(); e.stopPropagation();
                    self._save(true, 'next');
                }
            });

            // Handlebar Drag Resizer Logic
            this.element.on('mousedown' + ns, '.dt-modal-resizer', function(e) {
                e.preventDefault();

                const $left = self.element.find('.dt-modal-body-left');
                const $right = self.element.find('.dt-modal-body-right');
                const $body = self.element.find('.dt-modal-body');
                const bodyWidth = $body.width();
                const startX = e.clientX;
                const startLeftWidth = $left.outerWidth();

                // Account for iframe window targeting if mouse slips into preview
                let $dragTargets = $(window);
                const iframe = $('#docktree-preview-frame')[0];
                if (iframe && iframe.contentWindow) {
                    try { $dragTargets = $dragTargets.add(iframe.contentWindow); } catch(err){}
                }

                $body.css('user-select', 'none'); // Prevent text selections

                $dragTargets.on('mousemove.dtResizing', function(moveEvent) {
                    const deltaX = moveEvent.clientX - startX;
                    let newLeftWidth = startLeftWidth + deltaX;

                    // Boundaries constraints (e.g., minimum 30%, maximum 80%)
                    let leftPercent = (newLeftWidth / bodyWidth) * 100;
                    if (leftPercent < 30) leftPercent = 30;
                    if (leftPercent > 80) leftPercent = 80;

                    $left.css('width', leftPercent + '%');
                    $right.css('width', (100 - leftPercent) + '%');
                });

                $dragTargets.on('mouseup.dtResizing', function() {
                    $body.css('user-select', '');
                    $dragTargets.off('.dtResizing');
                });
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
                if (e.keyCode === 27) { e.preventDefault(); self.close(); }
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
        _getSubclassData: function() { return {}; },
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
                <div class="dt-form-group" style="flex-grow:1; display:flex; flex-direction:column; margin-bottom:0;">
                    <label>HTML Markup Payload</label>
                    <textarea id="dt-widget-content" class="dt-form-textarea" style="flex-grow:1; font-family:monospace;" placeholder="Type markup content..."></textarea>
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
    // PHASE 3: TEMPLATE PROCESSOR META-WIDGET
    // ==========================================
    $.widget("docktree.widgetEditorTemplateProcessor", $.docktree.nodeEditorBase, {
        options: { title: "Template Component Editor", widgetName: "template" },
        _create: function() {
            this._super();
            this.element.find('.dt-subclass-fields').append(`
                <div class="dt-tpl-tabs">
                    <button type="button" class="dt-tpl-tab active" data-target="data">Data UI</button>
                    <button type="button" class="dt-tpl-tab" data-target="template">Template HTML</button>
                    <button type="button" class="dt-tpl-tab" data-target="script">Script Engine</button>
                </div>
                
                <div id="dt-tpl-pane-data" class="dt-tpl-pane active" style="overflow-y:auto; padding-right:10px;">
                    </div>
                
                <div id="dt-tpl-pane-template" class="dt-tpl-pane">
                    <div class="dt-form-group" style="height:100%;">
                        <label>Handlebars-style Template Payload ( {{var}} )</label>
                        <textarea id="dt-tpl-raw-html" class="dt-form-textarea" style="flex-grow:1; font-family:monospace; white-space:pre;" placeholder="<div>{{title}}</div>"></textarea>
                    </div>
                </div>

                <div id="dt-tpl-pane-script" class="dt-tpl-pane">
                    <div class="dt-form-group" style="height:100%;">
                        <label>DocktreeComponent init() Script</label>
                        <textarea id="dt-tpl-raw-js" class="dt-form-textarea" style="flex-grow:1; font-family:monospace; white-space:pre;" placeholder="console.log(this.props);&#10;this.on(this.find('.btn'), 'click', (e) => alert('Clicked!'));"></textarea>
                    </div>
                </div>
            `);

            this._bindProcessorEvents();
        },
        _bindProcessorEvents: function() {
            const self = this;
            const ns = ".tplProcessor";

            this.element.on('click' + ns, '.dt-tpl-tab', function(e) {
                e.preventDefault();
                self.element.find('.dt-tpl-tab').removeClass('active');
                $(this).addClass('active');
                self.element.find('.dt-tpl-pane').removeClass('active');
                self.element.find('#dt-tpl-pane-' + $(this).data('target')).addClass('active');

                if ($(this).data('target') === 'data') {
                    self._buildDataTreeInspector();
                }
            });

            this.element.on('click' + ns, '.dt-data-add-btn', function(e) {
                e.preventDefault();
                const listContainer = $(this).siblings('.dt-data-list-container');
                const arrayName = $(this).data('array');
                const keys = $(this).data('keys').split(',');
                self._appendDataListItem(listContainer, arrayName, keys, {});
            });

            this.element.on('click' + ns, '.dt-data-list-item-remove', function(e) {
                e.preventDefault();
                $(this).closest('.dt-data-list-item').remove();
            });

            this.element.on('keydown' + ns, '.dt-data-list-item input, .dt-data-list-item textarea', function(e) {
                if (e.keyCode === 46 && e.shiftKey) { 
                    e.preventDefault();
                    $(this).closest('.dt-data-list-item').remove();
                }
                if (e.keyCode === 13 && e.ctrlKey && e.altKey) {
                    e.preventDefault();
                    $(this).closest('.dt-data-inspector-node').find('.dt-data-add-btn').trigger('click');
                    $(this).closest('.dt-data-inspector-node').find('.dt-data-list-item:last-child input:first').focus();
                }
            });
        },
        open: function(nodeId, labelVal, classVal, styleVal, nameVal, contentHtml, attrsVal) {
            this._super(nodeId, labelVal, classVal, styleVal, attrsVal);
            this.element.find('#dt-universal-attrs').val((attrsVal || '').replace(/\s*data-dt-\S+="[^"]*"/g, '').trim());
            const rawAttrs = attrsVal || '';
            let rawTpl = '', rawJs = '', rawJson = '{}';
            
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = `<div ${rawAttrs}></div>`;
            const tempEl = tempDiv.firstChild;

            if (tempEl) {
                rawTpl = decodeURIComponent(tempEl.getAttribute('data-dt-tpl') || '');
                rawJs = decodeURIComponent(tempEl.getAttribute('data-dt-js') || '');
                rawJson = decodeURIComponent(tempEl.getAttribute('data-dt-json') || '{}');
            }

            if (!rawTpl && !rawJs && rawJson === '{}') {
                rawTpl = `<div class="card mb-3">\n  <div class="card-body">\n    <h5 class="card-title">{{title}}</h5>\n    <p class="card-text">{{description}}</p>\n    <ul class="list-group list-group-flush">\n      {{#each features}}\n        <li class="list-group-item">{{feature_name}}</li>\n      {{/each}}\n    </ul>\n  </div>\n</div>`;
                rawJson = `{"title":"Sample Title", "description":"Description content", "features":[{"feature_name":"Feature 1"}]}`;
            }

            this.element.find('#dt-tpl-raw-html').val(rawTpl);
            this.element.find('#dt-tpl-raw-js').val(rawJs);
            this.currentJsonData = {};
            try { this.currentJsonData = JSON.parse(rawJson); } catch(e) {}

            this.element.find('.dt-tpl-tab[data-target="data"]').trigger('click');
        },
        _buildDataTreeInspector: function() {
            const templateHtml = this.element.find('#dt-tpl-raw-html').val();
            const $dataPane = this.element.find('#dt-tpl-pane-data');
            $dataPane.empty();

            if (!templateHtml.trim()) {
                $dataPane.append('<div class="dt-data-empty-msg">Template is empty. Write HTML with {{variables}} in the Template tab to generate fields.</div>');
                return;
            }

            const eachRegex = /\{\{#each\s+([a-zA-Z0-9_]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
            const arrays = [];
            let match;
            let strippedHtml = templateHtml;

            while ((match = eachRegex.exec(templateHtml)) !== null) {
                const arrName = match[1];
                const blockContent = match[2];
                const keys = [];
                const varRegex = /\{\{([a-zA-Z0-9_]+)\}\}/g;
                let varMatch;
                while ((varMatch = varRegex.exec(blockContent)) !== null) { keys.push(varMatch[1]); }
                
                arrays.push({ name: arrName, keys: [...new Set(keys)] });
                strippedHtml = strippedHtml.replace(match[0], '');
            }

            const varRegex = /\{\{([a-zA-Z0-9_]+)\}\}/g;
            const simpleVars = [];
            while ((match = varRegex.exec(strippedHtml)) !== null) {
                if (match[1] !== 'each' && !match[1].startsWith('/')) {
                    simpleVars.push(match[1]);
                }
            }
            const uniqueSimpleVars = [...new Set(simpleVars)];

            if (uniqueSimpleVars.length === 0 && arrays.length === 0) {
                $dataPane.append('<div class="dt-data-empty-msg">No {{variables}} detected in template.</div>');
                return;
            }

            if (uniqueSimpleVars.length > 0) {
                const $rootNode = $(`<div class="dt-data-inspector-node"><div class="dt-data-inspector-header">Global Properties</div></div>`);
                uniqueSimpleVars.forEach(key => {
                    const val = this.currentJsonData[key] || '';
                    const isLongText = key.toLowerCase().includes('text') || key.toLowerCase().includes('desc');
                    const inputHtml = isLongText 
                        ? `<textarea class="dt-form-textarea dt-data-val" data-key="${key}" rows="2">${val}</textarea>`
                        : `<input type="text" class="dt-form-input dt-data-val" data-key="${key}" value="${val.replace(/"/g, '&quot;')}" />`;
                    
                    $rootNode.append(`
                        <div class="dt-form-group" style="margin-bottom:8px;">
                            <label>${key.replace(/_/g, ' ')}</label>
                            ${inputHtml}
                        </div>
                    `);
                });
                $dataPane.append($rootNode);
            }

            arrays.forEach(arrDef => {
                const $arrNode = $(`
                    <div class="dt-data-inspector-node" data-array="${arrDef.name}">
                        <div class="dt-data-inspector-header">List: ${arrDef.name} <span style="font-weight:normal; font-size:10px; color:#94a3b8;">(Ctrl+Alt+Enter to append)</span></div>
                        <div class="dt-data-list-container"></div>
                        <button type="button" class="dt-data-add-btn" data-array="${arrDef.name}" data-keys="${arrDef.keys.join(',')}">+ Add Row</button>
                    </div>
                `);
                
                const existingItems = Array.isArray(this.currentJsonData[arrDef.name]) ? this.currentJsonData[arrDef.name] : [];
                existingItems.forEach(itemData => {
                    this._appendDataListItem($arrNode.find('.dt-data-list-container'), arrDef.name, arrDef.keys, itemData);
                });

                $dataPane.append($arrNode);
            });
        },
        _appendDataListItem: function($container, arrayName, keys, itemData) {
            let fieldsHtml = '';
            keys.forEach(key => {
                const val = itemData[key] || '';
                fieldsHtml += `
                    <div class="dt-form-group">
                        <label>${key}</label>
                        <input type="text" class="dt-form-input dt-data-item-val" data-key="${key}" value="${val.replace(/"/g, '&quot;')}" />
                    </div>
                `;
            });

            $container.append(`
                <div class="dt-data-list-item">
                    <button class="dt-data-list-item-remove" title="Remove (Shift+Delete)"><span class="dashicons dashicons-trash"></span></button>
                    ${fieldsHtml}
                </div>
            `);
        },
        _serializeDataTreeToJson: function() {
            const data = {};
            const $dataPane = this.element.find('#dt-tpl-pane-data');

            $dataPane.children('.dt-data-inspector-node:not([data-array])').find('.dt-data-val').each(function() {
                data[$(this).data('key')] = $(this).val();
            });

            $dataPane.children('.dt-data-inspector-node[data-array]').each(function() {
                const arrName = $(this).data('array');
                const items = [];
                $(this).find('.dt-data-list-item').each(function() {
                    const itemObj = {};
                    $(this).find('.dt-data-item-val').each(function() {
                        itemObj[$(this).data('key')] = $(this).val();
                    });
                    items.push(itemObj);
                });
                data[arrName] = items;
            });

            return data;
        },
        _compileTemplateHTML: function(template, data) {
            let html = template;
            
            html = html.replace(/\{\{#each\s+([a-zA-Z0-9_]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, function(match, arrName, content) {
                const arr = data[arrName] || [];
                let out = '';
                arr.forEach(item => {
                    let itemHtml = content;
                    for (let key in item) {
                        itemHtml = itemHtml.replace(new RegExp('\\{\\{' + key + '\\}\\}', 'g'), item[key] || '');
                    }
                    out += itemHtml;
                });
                return out;
            });
            
            html = html.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, function(match, varName) {
                return data[varName] !== undefined ? data[varName] : '';
            });

            return html;
        },
       _getSubclassData: function() {
            if (this.element.find('#dt-tpl-pane-data').hasClass('active')) {
                this.currentJsonData = this._serializeDataTreeToJson();
            }

            const rawTpl = this.element.find('#dt-tpl-raw-html').val();
            const rawJs = this.element.find('#dt-tpl-raw-js').val();
            const compiledHtml = this._compileTemplateHTML(rawTpl, this.currentJsonData);

            // Clean previous iterations of custom tracking tags to prevent stacking bloat
            let customAttrs = this.element.find('#dt-universal-attrs').val().trim();
            customAttrs = customAttrs.replace(/data-dt-(tpl|js|json)="[^"]*"\s*/g, '').trim();

            // Append clean, fresh tracking values
            customAttrs += (customAttrs ? ' ' : '') + `data-dt-tpl="${encodeURIComponent(rawTpl)}"`;
            customAttrs += ` data-dt-js="${encodeURIComponent(rawJs)}"`;
            customAttrs += ` data-dt-json="${encodeURIComponent(JSON.stringify(this.currentJsonData))}"`;

            if (rawJs.trim()) {
                try { new Function('DocktreeComponent', `return class extends DocktreeComponent { init() { ${rawJs} } }`); } 
                catch (e) { alert(`Docktree JS Sandbox Warning: Syntax error detected in script.\n\n${e.message}`); }
            }

            this.element.find('#dt-universal-attrs').val(customAttrs.trim());

            return {
                name: 'template',
                content: compiledHtml
            };
        },
        _destroy: function() {
            this.element.off(".tplProcessor");
            this._super();
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