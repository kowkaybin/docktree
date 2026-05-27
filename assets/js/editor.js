/**
 * Author: Kay Bin (vibe Gemini 20260521)
 */
jQuery(document).ready(function($) {
    const $body = $('body');
    const $container = $('.docktree-split-container');
    const $leftPanel = $('#dt-left-panel');
    const $resizer = $('#docktree-resizer');
    const $dtTextarea = $('#docktree-shadow-textarea');
    const $wpTextarea = $('#content');
    const $iframe = $('#docktree-preview-frame');
    const $iframeWrapper = $('#dt-iframe-zoom-wrapper');
    const $refreshBtn = $('#dt-refresh-btn');
    const $shortcodeToggle = $('#dt-shortcode-toggle');
    const $sidebarToggle = $('#dt-sidebar-toggle');
    const $contextMenu = $('#dt-context-menu');
    const $universalAddMenu = $('#dt-universal-add-menu');

    const $savePageBtn = $('#dt-save-page-btn');
    const $previewPageBtn = $('#dt-preview-page-btn');

    let activeTab = localStorage.getItem('docktree_active_tab') || 'tree';
    let nodeCounter = 1;
    let clipboardNodeHtml = '';
    let clipboardStyle = null;
    let selectedNodes = new Set();
    let contextNodeId = '';

    window.dtModalAnimClass = '';
    const $editorTargetEl = $('#dt-universal-editor-dialog');

    // ==========================================
    // REUSABLE SUB-WIDGET INSTANTIATION TRIGGERS
    // ==========================================
    function resetAndPrepareDialog() {
        if ($editorTargetEl.data("docktree-rowEditor")) { $editorTargetEl.rowEditor("destroy"); }
        if ($editorTargetEl.data("docktree-columnEditor")) { $editorTargetEl.columnEditor("destroy"); }
        if ($editorTargetEl.data("docktree-widgetEditor")) { $editorTargetEl.widgetEditor("destroy"); }
        if ($editorTargetEl.data("docktree-widgetEditorText")) { $editorTargetEl.widgetEditorText("destroy"); }
        if ($editorTargetEl.data("docktree-widgetEditorImage")) { $editorTargetEl.widgetEditorImage("destroy"); }
		if ($editorTargetEl.data("docktree-widgetEditorTemplateProcessor")) { $editorTargetEl.widgetEditorTemplateProcessor("destroy"); }
        $editorTargetEl.empty().removeClass().attr('style', 'display:none;');
    }

    function openRowEditor(nodeId, label, classes, style, gutter, attrs) {
        resetAndPrepareDialog();
        $editorTargetEl.rowEditor({
            onSave: function(base, sub, goToNext, direction) {
                const $vDom = parseHTMLToVirtualDOM();
                const $target = $vDom.find(`[data-dt-id="${base.nodeId}"]`).first();
                if ($target.length) {
                    if (base.label) { $target.attr('data-dt-label', base.label); } else { $target.removeAttr('data-dt-label'); }
                    $target.attr('class', ('row ' + sub.gutter + ' ' + base.classes).trim());
                    if (base.style) { $target.attr('style', base.style); } else { $target.removeAttr('style'); }
                    applyCustomAttributes($target, base.attrs);
                    commitWorkspace($vDom);
                    if (goToNext) {
                        triggerGlobalEditNext(base.nodeId, 'row', direction || 'next');
                    }
                }
            }
        }).rowEditor("open", nodeId, label, classes, style, gutter, attrs);
    }

    function openColumnEditor(nodeId, label, classes, style, attrs) {
        resetAndPrepareDialog();
        $editorTargetEl.columnEditor({
            onSave: function(base, sub, goToNext, direction) {
                const $vDom = parseHTMLToVirtualDOM();
                const $target = $vDom.find(`[data-dt-id="${base.nodeId}"]`).first();
                if ($target.length) {
                    if (base.label) { $target.attr('data-dt-label', base.label); } else { $target.removeAttr('data-dt-label'); }
                    $target.attr('class', (base.classes || 'col-12').trim());
                    if (base.style) { $target.attr('style', base.style); } else { $target.removeAttr('style'); }
                    applyCustomAttributes($target, base.attrs);
                    commitWorkspace($vDom);
                    if (goToNext) {
                        triggerGlobalEditNext(base.nodeId, 'column', direction || 'next');
                    }
                }
            }
        }).columnEditor("open", nodeId, label, classes, style, attrs);
    }

    function openWidgetEditor(nodeId, type, label, classes, style, name, content, attrs) {
        resetAndPrepareDialog();
        let widgetInstanceName = "widgetEditor";
        let options = {
            onSave: function(base, sub, goToNext, direction) {
                const $vDom = parseHTMLToVirtualDOM();
                const $target = $vDom.find(`[data-dt-id="${base.nodeId}"]`).first();
                if ($target.length) {
                    if (base.label) { $target.attr('data-dt-label', base.label); } else { $target.removeAttr('data-dt-label'); }
                    $target.attr('data-dt-widget', sub.name);
                    $target.attr('class', ('dt-widget ' + base.classes).trim());
                    if (base.style) { $target.attr('style', base.style); } else { $target.removeAttr('style'); }
                    $target.find('.dt-widget-render').html(sub.content);
                    applyCustomAttributes($target, base.attrs);
                    commitWorkspace($vDom);

                    if (goToNext) {
                        triggerGlobalEditNext(base.nodeId, 'widget', direction || 'next');
                    }
                }
            }
        };

        if (type === 'text') {
            widgetInstanceName = "widgetEditorText";
        } else if (type === 'banner') {
            widgetInstanceName = "widgetEditorImage";
        }

        $editorTargetEl[widgetInstanceName](options)[widgetInstanceName]("open", nodeId, label, classes, style, name, content, attrs);
    }

	function openWidgetEditorTemplate(nodeId, type, label, classes, style, name, content, attrs) {
        resetAndPrepareDialog();
        // Shift entirely to meta-template processor pipeline implementation
        $editorTargetEl.widgetEditorTemplateProcessor({
            onSaveOld: function(base, sub, goToNext, direction) {
                const $vDom = parseHTMLToVirtualDOM();
                const $target = $vDom.find(`[data-dt-id="${base.nodeId}"]`).first();
                if ($target.length) {
                    if (base.label) { $target.attr('data-dt-label', base.label); } else { $target.removeAttr('data-dt-label'); }
                    $target.attr('data-dt-widget', sub.name);
                    $target.attr('class', ('dt-widget ' + base.classes).trim());
                    if (base.style) { $target.attr('style', base.style); } else { $target.removeAttr('style'); }
                    $target.find('.dt-widget-render').html(sub.content);
                    applyCustomAttributes($target, base.attrs);
                    commitWorkspace($vDom);
                    
                    if (goToNext) triggerGlobalEditNext(base.nodeId, 'widget', direction || 'next');
                }
            },
            onSave: function(base, sub, goToNext, direction) {
                const $vDom = parseHTMLToVirtualDOM();
                const $target = $vDom.find(`[data-dt-id="${base.nodeId}"]`).first();
                if ($target.length) {
                    if (base.label) { $target.attr('data-dt-label', base.label); } else { $target.removeAttr('data-dt-label'); }
                    $target.attr('data-dt-widget', sub.name);
                    $target.attr('class', ('dt-widget ' + base.classes).trim());
                    if (base.style) { $target.attr('style', base.style); } else { $target.removeAttr('style'); }
                    $target.find('.dt-widget-render').html(sub.content);

                    // FIX: Extract the updated attributes payload compiled by _getSubclassData()
                    const freshAttrs = $('#dt-universal-attrs').val().trim();
                    applyCustomAttributes($target, freshAttrs);

                    commitWorkspace($vDom);

                    if (goToNext) triggerGlobalEditNext(base.nodeId, 'widget', direction || 'next');
                }
            }
        }).widgetEditorTemplateProcessor("open", nodeId, label, classes, style, name, content, attrs);
    }

    // Global Tree Traversal unconstrained by parent layouts
    function triggerGlobalEditNext(nodeId, type, direction = 'next') {
        const $allNodes = $(`#dt-tree-root [data-dt-type="${type}"]`);
        const currentIndex = $allNodes.index($allNodes.filter(`[data-dt-id="${nodeId}"]`));
        if (currentIndex === -1) return;

        let targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

        if (targetIndex >= 0 && targetIndex < $allNodes.length) {
            const $targetNode = $allNodes.eq(targetIndex);
            window.dtModalAnimClass = direction === 'next' ? 'dt-anim-slide-left' : 'dt-anim-slide-right';

            setTimeout(function() {
                if (type === 'row') $targetNode.find('.dt-edit-row-btn').first().trigger('click');
                else if (type === 'column') $targetNode.find('.dt-edit-col-btn').first().trigger('click');
                else if (type === 'widget') $targetNode.find('.dt-edit-widget-btn').first().trigger('click');
            }, 50);
        } else {
            const $statusMsg = $('#dt-runtime-status');
            const originalText = $statusMsg.text();
            $statusMsg.text(`No ${direction} elements found.`).css({'background': '#2563eb', 'color': '#fff'});
            setTimeout(() => { $statusMsg.text(originalText).css({'background': '', 'color': ''}); }, 2200);
        }
    }

    function applyCustomAttributes($el, attrString) {
        const attrsToRemove = [];
        $.each($el[0].attributes, function(i, attrib) {
            // Keep template engine and custom workspace properties intact
            if (attrib && attrib.name &&
                !attrib.name.startsWith('data-dt-') &&
                attrib.name !== 'class' &&
                attrib.name !== 'style') {
                attrsToRemove.push(attrib.name);
            }
        });
        attrsToRemove.forEach(name => $el.removeAttr(name));

        if (!attrString) return;
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = `<div ${attrString}></div>`;
        const tempEl = tempDiv.firstChild;
        if (tempEl) {
            $.each(tempEl.attributes, function(i, attrib) {
                if (attrib.name !== 'class' && attrib.name !== 'style') {
                    // Allow data-dt- configuration parameters to pass through
                    $el.attr(attrib.name, attrib.value);
                }
            });
        }
    }

    function getCustomAttributesString($el) {
        let attrs = [];
        $.each($el[0].attributes, function(i, attrib) {
            if (attrib && attrib.name && attrib.name !== 'class' && attrib.name !== 'style') {
                // Keep both standard custom attributes AND template data attributes
                attrs.push(`${attrib.name}="${attrib.value.replace(/"/g, '&quot;')}"`);
            }
        });
        return attrs.join(' ');
    }

    function commitWorkspace($vDom) {
        $dtTextarea.val($vDom.html()).trigger('change');
        syncTextareaToVisualPanels();
        updateDocktreePreview();
    }

    function parseStyleString(styleStr) {
        const obj = {};
        if (!styleStr) return obj;
        styleStr.split(';').forEach(function(part) {
            const colonIdx = part.indexOf(':');
            if (colonIdx > -1) {
                const prop = part.slice(0, colonIdx).trim();
                const val = part.slice(colonIdx + 1).trim();
                if (prop) obj[prop] = val;
            }
        });
        return obj;
    }

    function serializeStyleObject(obj) {
        return Object.entries(obj).filter(function([, v]) { return v; }).map(function([p, v]) { return p + ': ' + v; }).join('; ');
    }

    function updateBulkToolbar() {
        const $toolbar = $('#dt-bulk-toolbar');
        const count = selectedNodes.size;
        if (count < 2) { $toolbar.hide(); return; }

        const typeCounts = {};
        selectedNodes.forEach(function(nodeId) {
            const type = $('#dt-tree-root [data-dt-id="' + nodeId + '"]').attr('data-dt-type');
            if (type) typeCounts[type] = (typeCounts[type] || 0) + 1;
        });
        const parts = Object.entries(typeCounts).map(function(e) { return e[1] + ' ' + e[0]; });
        $('#dt-bulk-count-badge').text(count + ' selected (' + parts.join(', ') + ')');
        $('#dt-bulk-paste-style-btn').prop('disabled', !clipboardStyle);
        $toolbar.show();
    }

    function applyClipboardStyleToNodes(nodeIds) {
        if (!clipboardStyle) return;
        const $vDom = parseHTMLToVirtualDOM();
        nodeIds.forEach(function(nodeId) {
            const $el = $vDom.find('[data-dt-id="' + nodeId + '"]').first();
            if (!$el.length) return;
            if (clipboardStyle.classes.length) {
                const existing = ($el.attr('class') || '').split(/\s+/).filter(Boolean);
                $el.attr('class', Array.from(new Set(existing.concat(clipboardStyle.classes))).join(' '));
            }
            if (Object.keys(clipboardStyle.style).length) {
                const merged = Object.assign({}, parseStyleString($el.attr('style') || ''), clipboardStyle.style);
                const styleStr = serializeStyleObject(merged);
                if (styleStr) { $el.attr('style', styleStr); } else { $el.removeAttr('style'); }
            }
        });
        commitWorkspace($vDom);
    }

    // ==========================================
    // INITIALIZATION STATE DRIVERS
    // ==========================================
    if (localStorage.getItem('docktree_focus_mode') === 'active') {
        $body.addClass('docktree-focus-mode');
        $sidebarToggle.addClass('button-primary');
    }

    if ($wpTextarea.length && $dtTextarea.length) {
        $dtTextarea.val($wpTextarea.val());
    }

    if ($iframe.length) {
        $iframe.attr('src', docktreeData.previewUrl);
        $iframe.on('load', function() {
            updateDocktreePreview();
            $(`.dt-tab-btn[data-tab="${activeTab}"]`).trigger('click');
        });
    }

    $(document).on('click', '.dt-tree-action-btn, .dt-context-action, .dt-add-action-item, .dt-tab-btn', function(e) {
        if ($(this).is('a') || $(this).is('button')) {
            e.preventDefault();
        }
    });

    $('.dt-tab-btn').on('click', function(e) {
        e.preventDefault();
        $('.dt-tab-btn').removeClass('active');
        $(this).addClass('active');
        activeTab = $(this).data('tab');

        localStorage.setItem('docktree_active_tab', activeTab);

        $('.dt-tab-view').removeClass('active');
        $('#dt-view-' + activeTab).addClass('active');

        if (activeTab === 'tree' || activeTab === 'layout') {
            syncTextareaToVisualPanels();
        }
    });

    $dtTextarea.on('input propertychange change', function() {
        $wpTextarea.val($(this).val());
    });

    $refreshBtn.on('click', function(e) {
        e.preventDefault();
        updateDocktreePreview();
    });

    $shortcodeToggle.on('change', function() {
        updateDocktreePreview();
    });

    $('#dt-tree-add-row').on('click', function(e) {
        e.preventDefault();
        const rowId = 'dt-node-' + (nodeCounter++);
        const colId = 'dt-node-' + (nodeCounter++);
        const rowHtml = `<div class="row g-3" data-dt-type="row" data-dt-id="${rowId}"><div class="col-md-12" data-dt-type="column" data-dt-id="${colId}"></div></div>`;

        let val = $dtTextarea.val().trim();
        $dtTextarea.val(val + '\n' + rowHtml).trigger('change');
        syncTextareaToVisualPanels();
        updateDocktreePreview();
    });

    $('#dt-widget-search-input').on('input', function() {
        const query = $(this).val().toLowerCase();
        $('#dt-widget-options-list li').each(function() {
            const text = $(this).text().toLowerCase();
            if (text.indexOf(query) > -1) { $(this).show(); } else { $(this).hide(); }
        });
    });

    // Smart filtering so clicking action buttons doesn't globally hide the menu instantly
    $(document).on('click', function(e) {
        if (!$(e.target).closest('.dt-tree-action-btn, .dt-dropdown-menu').length) {
            $contextMenu.hide();
            $universalAddMenu.hide();
        }
    });

    // ==========================================
    // NON-DESTRUCTIVE DOM TAGGING AND SYNC PARSER
    // ==========================================
    function parseHTMLToVirtualDOM() {
        const rawHTML = $dtTextarea.val();
        const parser = new DOMParser();
        const doc = parser.parseFromString(rawHTML, 'text/html');
        const $bodyNode = $(doc.body);

        nodeCounter = 1;
        const seenIds = new Set();

        $bodyNode.find('[data-dt-id]').each(function() {
            const id = $(this).attr('data-dt-id');
            const num = parseInt(id.replace('dt-node-', ''), 10);
            if (!isNaN(num) && num >= nodeCounter) {
                nodeCounter = num + 1;
            }
        });

        $bodyNode.find('[data-dt-id]').each(function() {
            const $el = $(this);
            let currentId = $el.attr('data-dt-id');

            if (seenIds.has(currentId)) {
                currentId = 'dt-node-' + (nodeCounter++);
                $el.attr('data-dt-id', currentId);
            }
            seenIds.add(currentId);
        });

        $bodyNode.find('*').each(function() {
            const $el = $(this);
            let type = '';

            if ($el.hasClass('row')) {
                type = 'row';
            } else if ($el.is('[class*="col-"]')) {
                type = 'column';
            } else if ($el.hasClass('dt-widget')) {
                type = 'widget';
            }

            if (type) {
                $el.attr('data-dt-type', type);
                if (!$el.attr('data-dt-id')) {
                    $el.attr('data-dt-id', 'dt-node-' + (nodeCounter++));
                }
            }
        });

        return $bodyNode;
    }

    function syncTextareaToVisualPanels() {
        const $virtualDOM = parseHTMLToVirtualDOM();
        const cleanedHtml = $virtualDOM.html();
        if (cleanedHtml !== $dtTextarea.val()) {
            $dtTextarea.val(cleanedHtml).trigger('change');
        }

        buildTreeUI($virtualDOM);
        buildLayoutUI($virtualDOM);
    }

    // ==========================================
    // TREE VIEW RENDERING & SORTABLE INTEGRATION
    // ==========================================
    function buildTreeUI($virtualDOM) {
        const $treeRoot = $('#dt-tree-root');
        $treeRoot.empty();

        function renderTreeNode($parentEl, $targetUl) {
            $parentEl.children('[data-dt-type]').each(function() {
                const $el = $(this);
                const nodeType = $el.attr('data-dt-type');
                const nodeId = $el.attr('data-dt-id');

                let nodeLabel = '';
                if (nodeType === 'row') {
                    nodeLabel = $el.attr('data-dt-label') || 'Row';
                } else if (nodeType === 'column') {
                    const colLabel = $el.attr('data-dt-label') || 'Column';
                    const classes = $el.attr('class').split(' ');
                    const colClasses = classes.filter(c => /^col(-[a-z0-9]+)*$/.test(c) || c === 'col');
                    const colSpec = colClasses.length ? colClasses.join(' ') : 'col-12';
                    nodeLabel = `${colLabel} <span class="dt-col-class-muted">${colSpec}</span>`;
                } else if (nodeType === 'widget') {
                    const widgetType = $el.attr('data-dt-widget') || 'text';
                    const friendlyType = widgetType.charAt(0).toUpperCase() + widgetType.slice(1);
                    const customLabel = $el.attr('data-dt-label');
                    nodeLabel = customLabel ? `${friendlyType}: ${customLabel}` : friendlyType;
                } else {
                    nodeLabel = nodeType.charAt(0).toUpperCase() + nodeType.slice(1);
                }

                const $li = $(`
                    <li class="dt-tree-item dt-tree-${nodeType}${selectedNodes.has(nodeId) ? ' dt-tree-item--selected' : ''}" data-dt-id="${nodeId}" data-dt-type="${nodeType}">
                        <div class="dt-tree-item-header">
                            <span class="dt-tree-item-title">
                                <span class="dashicons dashicons-${nodeType === 'row' ? 'menu-alt' : nodeType === 'column' ? 'columns' : 'art'}"></span>
                                ${nodeLabel}
                            </span>
                            <div class="dt-tree-item-actions">
                                ${nodeType === 'row' ? '<button class="dt-tree-action-btn dt-add-col-btn" title="Add Column"><span class="dashicons dashicons-plus"></span></button>' : ''}
                                ${nodeType === 'column' ? '<button class="dt-tree-action-btn dt-universal-plus-btn" title="Add Element Content"><span class="dashicons dashicons-plus"></span></button>' : ''}
                                ${nodeType === 'row' ? '<button class="dt-tree-action-btn dt-edit-row-btn" title="Row Properties"><span class="dashicons dashicons-admin-appearance"></span></button>' : ''}
                                ${nodeType === 'column' ? '<button class="dt-tree-action-btn dt-edit-col-btn" title="Cell Layout Properties"><span class="dashicons dashicons-admin-appearance"></span></button>' : ''}
                                ${nodeType === 'widget' ? '<button class="dt-tree-action-btn dt-edit-widget-btn" title="Edit Component"><span class="dashicons dashicons-edit"></span></button>' : ''}
                                <button class="dt-tree-action-btn dt-options-btn" title="Node Options"><span class="dashicons dashicons-ellipsis"></span></button>
                            </div>
                        </div>
                        ${nodeType !== 'widget' ? '<ul class="dt-tree-list"></ul>' : ''}
                    </li>
                `);

                $targetUl.append($li);

                if (nodeType !== 'widget') {
                    renderTreeNode($el, $li.children('.dt-tree-list'));
                }
            });
        }

        renderTreeNode($virtualDOM, $treeRoot);
        initializeTreeSortables();
        bindTreeEvents();
    }

    function initializeTreeSortables() {
        $('.dt-tree-list').each(function() {
            const listEl = this;
            const $parentItem = $(listEl).closest('.dt-tree-item');
            const parentType = $parentItem.attr('data-dt-type');

            let groupConfig = { name: 'nested-rows' };

            if (!parentType) {
                groupConfig = { name: 'rows', put: ['rows'] };
            } else if (parentType === 'row') {
                groupConfig = { name: 'columns', put: ['columns'] };
            } else if (parentType === 'column') {
                groupConfig = { name: 'column-contents', put: ['column-contents', 'widgets', 'rows'] };
            }

            new Sortable(listEl, {
                group: groupConfig,
                animation: 160,
                fallbackOnBody: true,
                swapThreshold: 0.55,
                handle: '.dt-tree-item-title',
                onEnd: function() {
                    serializeTreeToTextarea();
                }
            });
        });
    }

    function serializeTreeToTextarea() {
        const parser = new DOMParser();
        const doc = parser.parseFromString('<body></body>', 'text/html');
        const $newVirtualDOM = $(doc.body);

        function traverseTreeList($ul, $domContainer) {
            $ul.children('.dt-tree-item').each(function() {
                const $li = $(this);
                const nodeId = $li.attr('data-dt-id');
                const nodeType = $li.attr('data-dt-type');

                const $originalTextNode = parseHTMLToVirtualDOM().find(`[data-dt-id="${nodeId}"]`).first();
                if (!$originalTextNode.length) return;

                const $clonedNode = $originalTextNode.clone().empty();
                $domContainer.append($clonedNode);

                if (nodeType !== 'widget') {
                    traverseTreeList($li.children('.dt-tree-list'), $clonedNode);
                } else {
                    $clonedNode.html($originalTextNode.html());
                }
            });
        }

        traverseTreeList($('#dt-tree-root'), $newVirtualDOM);
        $dtTextarea.val($newVirtualDOM.html()).trigger('change');
        updateDocktreePreview();
    }

    function bindTreeEvents() {
        // Single click on tree item header toggles selection (Ctrl/Cmd = multi-add)
        $('.dt-tree-item .dt-tree-item-header').off('click.select').on('click.select', function(e) {
            if ($(e.target).closest('.dt-tree-item-actions').length) return;
            const $item = $(this).closest('.dt-tree-item');
            const nodeId = $item.attr('data-dt-id');

            if (e.ctrlKey || e.metaKey) {
                if (selectedNodes.has(nodeId)) {
                    selectedNodes.delete(nodeId);
                    $item.removeClass('dt-tree-item--selected');
                } else {
                    selectedNodes.add(nodeId);
                    $item.addClass('dt-tree-item--selected');
                }
            } else {
                const wasSelected = selectedNodes.has(nodeId);
                selectedNodes.clear();
                $('.dt-tree-item').removeClass('dt-tree-item--selected');
                if (!wasSelected) {
                    selectedNodes.add(nodeId);
                    $item.addClass('dt-tree-item--selected');
                }
            }
            updateBulkToolbar();
        });

        // Double clicking any tree item header will trigger its corresponding property editor
        $('.dt-tree-item .dt-tree-item-header').off('dblclick').on('dblclick', function(e) {
            e.preventDefault(); e.stopPropagation();
            const $item = $(this).closest('.dt-tree-item');
            const type = $item.attr('data-dt-type');
            if (type === 'row') $item.find('.dt-edit-row-btn').first().trigger('click');
            else if (type === 'column') $item.find('.dt-edit-col-btn').first().trigger('click');
            else if (type === 'widget') $item.find('.dt-edit-widget-btn').first().trigger('click');
        });

        $('.dt-options-btn').off('click').on('click', function(e) {
            e.preventDefault(); e.stopPropagation();
            const $btn = $(this);
            const offset = $btn.offset();
            contextNodeId = $btn.closest('.dt-tree-item').attr('data-dt-id');

            const $pasteBtn = $contextMenu.find('[data-action="paste"]');
            if (clipboardNodeHtml) { $pasteBtn.removeAttr('disabled'); } else { $pasteBtn.attr('disabled', 'disabled'); }

            const $pasteStyleBtn = $contextMenu.find('[data-action="paste-style"]');
            if (clipboardStyle) { $pasteStyleBtn.removeAttr('disabled'); } else { $pasteStyleBtn.attr('disabled', 'disabled'); }

            $contextMenu.css({ top: (offset.top + $btn.outerHeight()) + 'px', left: (offset.left - 120) + 'px' }).show();
        });

        $('.dt-universal-plus-btn').off('click').on('click', function(e) {
            e.preventDefault(); e.stopPropagation();
            const $btn = $(this);
            const offset = $btn.offset();
            contextNodeId = $btn.closest('.dt-tree-item').attr('data-dt-id');

            $('#dt-widget-search-input').val('').trigger('input');
            $universalAddMenu.css({ top: (offset.top + $btn.outerHeight()) + 'px', left: (offset.left - 140) + 'px' }).show();
        });

        $('.dt-add-col-btn').off('click').on('click', function(e) {
            e.preventDefault(); e.stopPropagation();
            const rowNodeId = $(this).closest('.dt-tree-item').attr('data-dt-id');
            const colId = 'dt-node-' + (nodeCounter++);
            const colHtml = `<div class="col-md-6" data-dt-type="column" data-dt-id="${colId}"></div>`;

            const $vDom = parseHTMLToVirtualDOM();
            $vDom.find(`[data-dt-id="${rowNodeId}"]`).append(colHtml);
            commitWorkspace($vDom);
        });

        $('.dt-edit-row-btn').off('click').on('click', function(e) {
            e.preventDefault(); e.stopPropagation();
            const nodeId = $(this).closest('.dt-tree-item').attr('data-dt-id');
            const $vDom = parseHTMLToVirtualDOM();
            const $row = $vDom.find(`[data-dt-id="${nodeId}"]`).first();

            if ($row.length) {
                const label = $row.attr('data-dt-label') || '';
                const classes = $row.attr('class').split(' ');
                const gutterClass = classes.find(c => c.startsWith('g-')) || 'g-3';
                const customClasses = classes.filter(c => !c.startsWith('g-') && c !== 'row').join(' ');
                const inlineStyle = $row.attr('style') || '';
                const attrs = getCustomAttributesString($row);

                openRowEditor(nodeId, label, customClasses, inlineStyle, gutterClass, attrs);
            }
        });

        $('.dt-edit-col-btn').off('click').on('click', function(e) {
            e.preventDefault(); e.stopPropagation();
            const nodeId = $(this).closest('.dt-tree-item').attr('data-dt-id');
            const $vDom = parseHTMLToVirtualDOM();
            const $col = $vDom.find(`[data-dt-id="${nodeId}"]`).first();

            if ($col.length) {
                const label = $col.attr('data-dt-label') || '';
                const classes = $col.attr('class') || 'col-12';
                const inlineStyle = $col.attr('style') || '';
                const attrs = getCustomAttributesString($col);

                openColumnEditor(nodeId, label, classes, inlineStyle, attrs);
            }
        });

        $('.dt-edit-widget-btn').off('click').on('click', function(e) {
            e.preventDefault(); e.stopPropagation();
            const nodeId = $(this).closest('.dt-tree-item').attr('data-dt-id');
            const $vDom = parseHTMLToVirtualDOM();
            const $widget = $vDom.find(`[data-dt-id="${nodeId}"]`).first();

            if ($widget.length) {
                const label = $widget.attr('data-dt-label') || '';
                const name = $widget.attr('data-dt-widget') || 'text';
                const content = $widget.find('.dt-widget-render').html() || '';
                const classes = $widget.attr('class').split(' ').filter(c => c !== 'dt-widget').join(' ');
                const style = $widget.attr('style') || '';
                const attrs = getCustomAttributesString($widget);

                if (name === 'template') {
                    openWidgetEditorTemplate(nodeId, name, label, classes, style, name, content, attrs);
                } else {
                    openWidgetEditor(nodeId, name, label, classes, style, name, content, attrs);
                }
            }
        });
    }

    // ==========================================
    // ADD ELEMENT SELECTION ACTIONS MANAGEMENT
    // ==========================================
    $('.dt-add-action-item').on('click', function(e) {
        e.preventDefault(); e.stopPropagation();
        const type = $(this).data('type');
        $universalAddMenu.hide();

        if (!contextNodeId) return;
        const $vDom = parseHTMLToVirtualDOM();
        const $targetColumn = $vDom.find(`[data-dt-id="${contextNodeId}"]`).first();

        if (!$targetColumn.length) return;

        if (type === 'row') {
            const rowId = 'dt-node-' + (nodeCounter++);
            const subColId = 'dt-node-' + (nodeCounter++);
            const nestedRowHtml = `<div class="row g-3" data-dt-type="row" data-dt-id="${rowId}"><div class="col-md-12" data-dt-type="column" data-dt-id="${subColId}"></div></div>`;
            $targetColumn.append(nestedRowHtml);
        } else if (type === 'widget') {
            const widgetType = $(this).data('widget');
            const widgetId = 'dt-node-' + (nodeCounter++);

            let initialPayload = `<p>Custom paragraph text component layout area content.</p>`;
            if (widgetType === 'banner') initialPayload = `<div class="bg-dark text-white p-5 text-center"><h2>Hero Banner Layout</h2><img src="https://picsum.photos/id/10/800/400" class="img-fluid mt-3 rounded" alt="Default Banner" /></div>`;
            if (widgetType === 'button') initialPayload = `<div class="text-center"><a href="#" class="btn btn-primary btn-lg">Action Link Button</a></div>`;
            if (widgetType === 'card') initialPayload = `<div class="card"><div class="card-body"><h5 class="card-title">Card Content Title</h5><p class="card-text">Some description paragraph element block metrics here.</p></div></div>`;
            if (widgetType === 'spacer') initialPayload = `<div style="height:40px; background: rgba(0,0,0,0.02); border: 1px dashed rgba(0,0,0,0.05);"></div>`;
            if (widgetType === 'template') initialPayload = '';

            const widgetHtml = `<div class="dt-widget" data-dt-type="widget" data-dt-widget="${widgetType}" data-dt-id="${widgetId}"><div class="dt-widget-render">${initialPayload}</div></div>`;
            $targetColumn.append(widgetHtml);

            if (widgetType === 'template') {
                commitWorkspace($vDom);
                openWidgetEditorTemplate(widgetId, 'widget', '', '', '', 'template', '', '');
                return;
            }
        }

        commitWorkspace($vDom);
    });

    // ==========================================
    // OPTIONS DROPDOWN ACTION HANDLERS
    // ==========================================
    $('.dt-context-action').on('click', function(e) {
        e.preventDefault(); e.stopPropagation();
        const action = $(this).data('action');
        $contextMenu.hide();

        if (!contextNodeId) return;
        const $vDom = parseHTMLToVirtualDOM();
        const $target = $vDom.find(`[data-dt-id="${contextNodeId}"]`).first();

        if (!$target.length) return;

        switch (action) {
            case 'copy':
                clipboardNodeHtml = $target[0].outerHTML;
                break;
            case 'duplicate':
                const $clone = $target.clone();
                $clone.removeAttr('data-dt-id');
                $clone.find('[data-dt-id]').removeAttr('data-dt-id');

                $target.after($clone);
                commitWorkspace($vDom);
                break;
            case 'paste':
                if (clipboardNodeHtml) {
                    const $pasteNode = $(clipboardNodeHtml);
                    $pasteNode.removeAttr('data-dt-id');
                    $pasteNode.find('[data-dt-id]').removeAttr('data-dt-id');

                    const targetType = $target.attr('data-dt-type');
                    const pasteNodeType = $pasteNode.attr('data-dt-type');

                    let canPaste = false;
                    if (targetType === 'column' && (pasteNodeType === 'widget' || pasteNodeType === 'row')) {
                        canPaste = true;
                    } else if (targetType === 'row' && pasteNodeType === 'column') {
                        canPaste = true;
                    } else if (targetType === 'row' && pasteNodeType === 'row') {
                        $target.after($pasteNode);
                    } else if (targetType === 'column' && pasteNodeType === 'column') {
                        $target.after($pasteNode);
                    } else if (targetType === 'widget' && pasteNodeType === 'widget') {
                        $target.after($pasteNode);
                    }

                    if (canPaste) { $target.append($pasteNode); }

                    commitWorkspace($vDom);
                }
                break;
            case 'delete':
                $target.remove();
                commitWorkspace($vDom);
                break;
            case 'copy-style':
                openCopyStyleDialog(contextNodeId);
                break;
            case 'paste-style':
                if (clipboardStyle) { applyClipboardStyleToNodes([contextNodeId]); }
                break;
        }
    });

    // ==========================================
    // BULK STYLING TOOLBAR HANDLERS
    // ==========================================
    $('#dt-bulk-clear-btn').on('click', function() {
        selectedNodes.clear();
        $('.dt-tree-item').removeClass('dt-tree-item--selected');
        updateBulkToolbar();
    });

    $('#dt-bulk-add-class-btn').on('click', function() {
        const tokensToAdd = $('#dt-bulk-add-class-input').val().trim().split(/\s+/).filter(Boolean);
        if (!tokensToAdd.length || !selectedNodes.size) return;
        const $vDom = parseHTMLToVirtualDOM();
        selectedNodes.forEach(function(nodeId) {
            const $el = $vDom.find('[data-dt-id="' + nodeId + '"]').first();
            if (!$el.length) return;
            const existing = ($el.attr('class') || '').split(/\s+/).filter(Boolean);
            $el.attr('class', Array.from(new Set(existing.concat(tokensToAdd))).join(' '));
        });
        commitWorkspace($vDom);
        $('#dt-bulk-add-class-input').val('');
    });

    $('#dt-bulk-remove-class-btn').on('click', function() {
        const tokensToRemove = new Set($('#dt-bulk-remove-class-input').val().trim().split(/\s+/).filter(Boolean));
        if (!tokensToRemove.size || !selectedNodes.size) return;
        const $vDom = parseHTMLToVirtualDOM();
        selectedNodes.forEach(function(nodeId) {
            const $el = $vDom.find('[data-dt-id="' + nodeId + '"]').first();
            if (!$el.length) return;
            const existing = ($el.attr('class') || '').split(/\s+/).filter(Boolean);
            $el.attr('class', existing.filter(function(c) { return !tokensToRemove.has(c); }).join(' '));
        });
        commitWorkspace($vDom);
        $('#dt-bulk-remove-class-input').val('');
    });

    $('#dt-bulk-replace-class-btn').on('click', function() {
        const fromToken = $('#dt-bulk-replace-from-input').val().trim();
        const toToken = $('#dt-bulk-replace-to-input').val().trim();
        if (!fromToken || !selectedNodes.size) return;
        const $vDom = parseHTMLToVirtualDOM();
        selectedNodes.forEach(function(nodeId) {
            const $el = $vDom.find('[data-dt-id="' + nodeId + '"]').first();
            if (!$el.length) return;
            const existing = ($el.attr('class') || '').split(/\s+/).filter(Boolean);
            const updated = existing.map(function(c) { return c === fromToken ? toToken : c; }).filter(Boolean);
            $el.attr('class', Array.from(new Set(updated)).join(' '));
        });
        commitWorkspace($vDom);
        $('#dt-bulk-replace-from-input').val('');
        $('#dt-bulk-replace-to-input').val('');
    });

    $('#dt-bulk-set-style-btn').on('click', function() {
        const prop = $('#dt-bulk-style-prop-input').val().trim();
        const val = $('#dt-bulk-style-val-input').val().trim();
        if (!prop || !selectedNodes.size) return;
        const $vDom = parseHTMLToVirtualDOM();
        selectedNodes.forEach(function(nodeId) {
            const $el = $vDom.find('[data-dt-id="' + nodeId + '"]').first();
            if (!$el.length) return;
            const styleObj = parseStyleString($el.attr('style') || '');
            if (val) { styleObj[prop] = val; } else { delete styleObj[prop]; }
            const styleStr = serializeStyleObject(styleObj);
            if (styleStr) { $el.attr('style', styleStr); } else { $el.removeAttr('style'); }
        });
        commitWorkspace($vDom);
        $('#dt-bulk-style-prop-input').val('');
        $('#dt-bulk-style-val-input').val('');
    });

    $('#dt-bulk-copy-style-btn').on('click', function() {
        const firstId = selectedNodes.size ? Array.from(selectedNodes)[0] : null;
        if (!firstId) return;
        openCopyStyleDialog(firstId);
    });

    $('#dt-bulk-paste-style-btn').on('click', function() {
        if (!clipboardStyle || !selectedNodes.size) return;
        applyClipboardStyleToNodes(Array.from(selectedNodes));
    });

    // ==========================================
    // COPY STYLE DIALOG
    // ==========================================
    const STRUCTURAL_CLASS_RE = [/^col(-|$)/, /^row$/, /^container(-|$)/, /^dt-/, /^g[xy]?-/];
    const STRUCTURAL_STYLE_PROPS = new Set(['display', 'position', 'width', 'height', 'float', 'clear',
        'flex', 'flex-direction', 'flex-wrap', 'flex-grow', 'flex-shrink', 'flex-basis',
        'grid', 'grid-template', 'grid-template-columns', 'grid-template-rows',
        'overflow', 'box-sizing']);

    function isStructuralClass(cls) {
        return STRUCTURAL_CLASS_RE.some(function(re) { return re.test(cls); });
    }

    function openCopyStyleDialog(nodeId) {
        const $vDom = parseHTMLToVirtualDOM();
        const $el = $vDom.find('[data-dt-id="' + nodeId + '"]').first();
        if (!$el.length) return;

        const label = $el.attr('data-dt-label') || ($el.attr('data-dt-type') || 'Node');
        const classes = ($el.attr('class') || '').split(/\s+/).filter(Boolean);
        const styleObj = parseStyleString($el.attr('style') || '');

        $('#dt-csd-node-label').text(label);

        const $classesList = $('#dt-csd-classes-list').empty();
        if (classes.length) {
            classes.forEach(function(cls) {
                const structural = isStructuralClass(cls);
                $classesList.append(
                    '<label class="dt-csd-check-item' + (structural ? ' dt-csd-structural' : '') + '">' +
                    '<input type="checkbox" value="' + cls + '"' + (structural ? '' : ' checked') + '/>' +
                    '<code>' + cls + '</code>' +
                    (structural ? '<span class="dt-csd-tag">structural</span>' : '') +
                    '</label>'
                );
            });
        } else {
            $classesList.append('<span class="dt-csd-empty">No classes</span>');
        }

        const $stylesList = $('#dt-csd-styles-list').empty();
        const styleEntries = Object.entries(styleObj);
        if (styleEntries.length) {
            styleEntries.forEach(function(entry) {
                const prop = entry[0], val = entry[1];
                const structural = STRUCTURAL_STYLE_PROPS.has(prop);
                $stylesList.append(
                    '<label class="dt-csd-check-item' + (structural ? ' dt-csd-structural' : '') + '">' +
                    '<input type="checkbox" value="' + prop + '"' + (structural ? '' : ' checked') + '/>' +
                    '<code>' + prop + ': ' + val + '</code>' +
                    (structural ? '<span class="dt-csd-tag">structural</span>' : '') +
                    '</label>'
                );
            });
        } else {
            $stylesList.append('<span class="dt-csd-empty">No inline styles</span>');
        }

        $('#dt-csd-toggle-all-classes').prop('checked', true);
        $('#dt-csd-toggle-all-styles').prop('checked', true);
        $('#dt-copy-style-dialog').data('source-style-obj', styleObj).css('display', 'flex');
    }

    $('#dt-csd-toggle-all-classes').on('change', function() {
        $('#dt-csd-classes-list input[type="checkbox"]').prop('checked', $(this).is(':checked'));
    });

    $('#dt-csd-toggle-all-styles').on('change', function() {
        $('#dt-csd-styles-list input[type="checkbox"]').prop('checked', $(this).is(':checked'));
    });

    $('#dt-csd-cancel-btn, #dt-csd-cancel2-btn').on('click', function() {
        $('#dt-copy-style-dialog').hide();
    });

    $('#dt-csd-confirm-btn').on('click', function() {
        const checkedClasses = [];
        $('#dt-csd-classes-list input[type="checkbox"]:checked').each(function() {
            checkedClasses.push($(this).val());
        });
        const sourceStyleObj = $('#dt-copy-style-dialog').data('source-style-obj') || {};
        const checkedStyle = {};
        $('#dt-csd-styles-list input[type="checkbox"]:checked').each(function() {
            const prop = $(this).val();
            if (sourceStyleObj[prop]) checkedStyle[prop] = sourceStyleObj[prop];
        });

        clipboardStyle = { classes: checkedClasses, style: checkedStyle };
        $('#dt-bulk-paste-style-btn').prop('disabled', false);
        $contextMenu.find('[data-action="paste-style"]').removeAttr('disabled');
        $('#dt-copy-style-dialog').hide();
    });

    // ==========================================
    // ABSTRACT SKELETON LAYOUT VIEW RENDERING
    // ==========================================
    function buildLayoutUI($virtualDOM) {
        const $diagramRoot = $('#dt-layout-diagram-root');
        $diagramRoot.empty();

        function renderLayoutNode($parentEl, $domContainer) {
            $parentEl.children('[data-dt-type]').each(function() {
                const $el = $(this);
                const nodeType = $el.attr('data-dt-type');
                const nodeId = $el.attr('data-dt-id');

                let nodeLabel = $el.attr('data-dt-label');

                if (nodeType === 'row') {
                    const labelText = nodeLabel ? nodeLabel.charAt(0).toUpperCase() + nodeLabel.slice(1) : "Row";
                    const $rowDiv = $(`
                        <div class="dt-layout-row" data-dt-id="${nodeId}" data-dt-type="row">
                            <div class="dt-layout-row-contents" style="display:flex; width:100%; gap:10px; min-height:40px;"></div>
                        </div>
                    `);
                    $rowDiv.attr('style', `--dt-row-label: "${labelText}";`);
                    $rowDiv.addClass('has-dynamic-label');
                    $domContainer.append($rowDiv);
                    renderLayoutNode($el, $rowDiv.find('.dt-layout-row-contents'));
                } else if (nodeType === 'column') {
                    let colClassLabel = nodeLabel || 'Column';
                    colClassLabel = colClassLabel.charAt(0).toUpperCase() + colClassLabel.slice(1);

                    const $colDiv = $(`
                        <div class="dt-layout-col" data-dt-id="${nodeId}" data-dt-type="column">
                            <strong style="font-size:10px; color:#10b981; margin-bottom:4px; display:block;">${colClassLabel}</strong>
                            <div class="dt-layout-col-contents" style="display:flex; flex-direction:column; gap:6px; min-height:30px;"></div>
                        </div>
                    `);
                    $domContainer.append($colDiv);
                    renderLayoutNode($el, $colDiv.find('.dt-layout-col-contents'));
                } else if (nodeType === 'widget') {
                    let widgetName = nodeLabel;
                    if (!widgetName) {
                        const widgetType = $el.attr('data-dt-widget') || 'text';
                        widgetName = widgetType;
                    }
                    widgetName = widgetName.charAt(0).toUpperCase() + widgetName.slice(1);

                    const $widgetDiv = $(`<div class="dt-layout-widget" data-dt-id="${nodeId}" data-dt-type="widget">${widgetName}</div>`);
                    $domContainer.append($widgetDiv);
                }
            });
        }

        renderLayoutNode($virtualDOM, $diagramRoot);
        initializeLayoutSortables();
        bindLayoutHoverEvents();
    }

    function initializeLayoutSortables() {
        new Sortable(document.getElementById('dt-layout-diagram-root'), {
            group: 'layout-rows',
            animation: 150,
            draggable: '.dt-layout-row',
            ghostClass: 'sortable-ghost',
            onEnd: function() { serializeLayoutViewToTextarea(); }
        });

        $('.dt-layout-row-contents').each(function() {
            new Sortable(this, {
                group: 'layout-columns',
                animation: 150,
                draggable: '.dt-layout-col',
                ghostClass: 'sortable-ghost',
                onEnd: function() { serializeLayoutViewToTextarea(); }
            });
        });

        $('.dt-layout-col-contents').each(function() {
            new Sortable(this, {
                group: { name: 'layout-column-contents', put: ['layout-column-contents', 'layout-rows', 'layout-widgets'] },
                animation: 150,
                ghostClass: 'sortable-ghost',
                fallbackOnBody: true,
                swapThreshold: 0.6,
                onEnd: function() { serializeLayoutViewToTextarea(); }
            });
        });
    }

    function serializeLayoutViewToTextarea() {
        const parser = new DOMParser();
        const doc = parser.parseFromString('<body></body>', 'text/html');
        const $newVirtualDOM = $(doc.body);

        function traverseLayoutDOM($visualParent, $domContainer) {
            $visualParent.children('[data-dt-type]').each(function() {
                const $visualNode = $(this);
                const nodeId = $visualNode.attr('data-dt-id');
                const nodeType = $visualNode.attr('data-dt-type');

                const $originalTextNode = parseHTMLToVirtualDOM().find(`[data-dt-id="${nodeId}"]`).first();
                if (!$originalTextNode.length) return;

                const $clonedNode = $originalTextNode.clone().empty();
                $domContainer.append($clonedNode);

                if (nodeType === 'row') {
                    traverseLayoutDOM($visualNode.find('.dt-layout-row-contents'), $clonedNode);
                } else if (nodeType === 'column') {
                    traverseLayoutDOM($visualNode.find('.dt-layout-col-contents'), $clonedNode);
                } else if (nodeType === 'widget') {
                    $clonedNode.html($originalTextNode.html());
                }
            });
        }

        traverseLayoutDOM($('#dt-layout-diagram-root'), $newVirtualDOM);
        $dtTextarea.val($newVirtualDOM.html()).trigger('change');
        updateDocktreePreview();
    }

    // ==========================================
    // BIDIRECTIONAL HOVER & SCROLL SYNC
    // ==========================================
    function bindLayoutHoverEvents() {
        const getIframeTarget = (targetId) => {
            const iframeWindow = $iframe[0].contentWindow;
            if (!iframeWindow) return null;
            return $(iframeWindow.document).find(`[data-dt-id="${targetId}"]`);
        };

        $('#dt-left-panel').off('mouseenter mouseleave click', '[data-dt-id]');

        $('#dt-left-panel').on('mouseenter', '[data-dt-id]', function(e) {
            e.stopPropagation();
            const targetId = $(this).attr('data-dt-id');
            const $targetEl = getIframeTarget(targetId);
            if ($targetEl && $targetEl.length) { $targetEl.css('outline', '3px solid #2563eb'); }
        }).on('mouseleave', '[data-dt-id]', function(e) {
            const targetId = $(this).attr('data-dt-id');
            const $targetEl = getIframeTarget(targetId);
            if ($targetEl && $targetEl.length) { $targetEl.css('outline', 'none'); }
        }).on('click', '.dt-layout-widget, .dt-layout-col, .dt-layout-row', function(e) {
            e.stopPropagation();
            const targetId = $(this).attr('data-dt-id');
            const $targetEl = getIframeTarget(targetId);

            if ($targetEl && $targetEl.length) {
                const iframeWindow = $iframe[0].contentWindow;
                iframeWindow.scrollTo({ top: $targetEl.offset().top - 120, behavior: 'smooth' });

                $targetEl.css('background', 'rgba(37, 99, 235, 0.15)');
                setTimeout(() => { $targetEl.css('background', ''); }, 600);
            }
        });

        $('#dt-layout-diagram-root').off('dblclick').on('dblclick', '.dt-layout-row, .dt-layout-col, .dt-layout-widget', function(e) {
            e.stopPropagation();
            const nodeId = $(this).attr('data-dt-id');
            const type = $(this).attr('data-dt-type');
            const $vDom = parseHTMLToVirtualDOM();
            const $target = $vDom.find(`[data-dt-id="${nodeId}"]`).first();

            if (!$target.length) return;

            if (type === 'row') {
                const label = $target.attr('data-dt-label') || '';
                const classes = $target.attr('class').split(' ');
                const gutterClass = classes.find(c => c.startsWith('g-')) || 'g-3';
                const customClasses = classes.filter(c => !c.startsWith('g-') && c !== 'row').join(' ');
                const inlineStyle = $target.attr('style') || '';
                const attrs = getCustomAttributesString($target);

                openRowEditor(nodeId, label, customClasses, inlineStyle, gutterClass, attrs);
            } else if (type === 'column') {
                const label = $target.attr('data-dt-label') || '';
                const classes = $target.attr('class') || 'col-12';
                const inlineStyle = $target.attr('style') || '';
                const attrs = getCustomAttributesString($target);

                openColumnEditor(nodeId, label, classes, inlineStyle, attrs);
            } else if (type === 'widget') {
                const label = $target.attr('data-dt-label') || '';
                const name = $target.attr('data-dt-widget') || 'text';
                const content = $target.find('.dt-widget-render').html() || '';
                const classes = $target.attr('class').split(' ').filter(c => c !== 'dt-widget').join(' ');
                const style = $target.attr('style') || '';
                const attrs = getCustomAttributesString($target);

                openWidgetEditor(nodeId, name, label, classes, style, name, content, attrs);
            }
        });
    }

    // ==========================================
    // VIEWPORT REFRESH LOGIC
    // ==========================================
    function updateDocktreePreview() {
        const rawHTML = $dtTextarea.val();
        const iframeWindow = $iframe[0].contentWindow;
        const executeShortcodes = $shortcodeToggle.is(':checked');

        if (!iframeWindow) return;
        const iframeDoc = iframeWindow.document;
        const $canvasRoot = $(iframeDoc).find('#docktree-canvas-root');

        if (!$canvasRoot.length) return;

        $canvasRoot.css('opacity', '0.4');

        if (executeShortcodes) {
            $.post(docktreeData.ajaxUrl, {
                action: 'docktree_parse_content',
                content: rawHTML,
                shortcodes: 'true'
            }, function(response) {
                if (response.success) { renderCanvas(response.data); } else { renderCanvas(rawHTML); }
            });
        } else {
            renderCanvas(rawHTML);
        }

        function renderCanvas(htmlContent) {
            $canvasRoot.html(htmlContent);
            $canvasRoot.css('opacity', '1');

            // Phase3 Javascript Components internally inside Sandbox
            if (iframeWindow.docktreeBootComponent) {
                $canvasRoot.find('[data-dt-type="widget"]').each(function() {
                    const id = $(this).attr('data-dt-id');
                    const scriptPayload = decodeURIComponent($(this).attr('data-dt-js') || '');
                    const jsonPayload = decodeURIComponent($(this).attr('data-dt-json') || '{}');
                    if (scriptPayload) {
                        iframeWindow.docktreeBootComponent(id, scriptPayload, jsonPayload);
                    }
                });
            }

            $(iframeDoc).off('click.contextDismiss').on('click.contextDismiss', function(e) {
                if (!$(e.target).closest('.dt-tree-action-btn, .dt-dropdown-menu').length) {
                    $contextMenu.hide();
                    $universalAddMenu.hide();
                }
            });

            $(iframeDoc).find('#docktree-canvas-root .row, #docktree-canvas-root [class*="col-"]').css({
                'cursor': 'pointer', 'transition': 'all 0.15s ease'
            });

            $(iframeDoc).off('mouseenter mouseleave dblclick', '#docktree-canvas-root [data-dt-id]');
            $(iframeDoc).on('mouseenter', '#docktree-canvas-root [data-dt-id]', function(e) {
                e.stopPropagation();
                const nodeId = $(this).attr('data-dt-id');
                $(this).css('outline', '2px dashed #2563eb');

                $(`#dt-left-panel [data-dt-id="${nodeId}"]`).css({
                    'background-color': '#e0f2fe', 'box-shadow': '0 0 0 2px #2563eb'
                });
            }).on('mouseleave', '#docktree-preview-frame, #docktree-canvas-root [data-dt-id]', function() {
                const nodeId = $(this).attr('data-dt-id');
                $(this).css('outline', 'none');
                $(`#dt-left-panel [data-dt-id="${nodeId}"]`).css({ 'background-color': '', 'box-shadow': '' });
            }).on('dblclick', '#docktree-canvas-root [data-dt-id]', function(e) {
                e.stopPropagation();
                const nodeId = $(this).attr('data-dt-id');
                const type = $(this).attr('data-dt-type');

                if (type === 'widget') {
                    const $vDom = parseHTMLToVirtualDOM();
                    const $widget = $vDom.find(`[data-dt-id="${nodeId}"]`).first();
                    if ($widget.length) {
                        openWidgetEditor(
                            nodeId,
                            $widget.attr('data-dt-widget') || 'text',
                            $widget.attr('data-dt-label') || '',
                            $widget.attr('class').split(' ').filter(c => c !== 'dt-widget').join(' '),
                            $widget.attr('style') || '',
                            $widget.attr('data-dt-widget') || 'text',
                            $widget.find('.dt-widget-render').html() || '',
                            getCustomAttributesString($widget)
                        );
                    }
                }
            });
        }
    }

    // ==========================================
    // INTERACTIVE LIVE PANEL RESIZING (DRAG SPLIT)
    // ==========================================
    let isDragging = false;
    $resizer.on('mousedown', function(e) { e.preventDefault(); isDragging = true; $body.css('cursor', 'col-resize'); });
    $(document).on('mousemove', function(e) {
        if (!isDragging) return;
        const containerOffsetLeft = $container.offset().left;
        const containerWidth = $container.width();
        const pointerRelativeX = e.pageX - containerOffsetLeft;
        let newWidthPercentage = (pointerRelativeX / containerWidth) * 100;
        if (newWidthPercentage < 15) newWidthPercentage = 15;
        if (newWidthPercentage > 60) newWidthPercentage = 60;
        $leftPanel.css('width', newWidthPercentage + '%');
    }).on('mouseup', function() { if (isDragging) { isDragging = false; $body.css('cursor', ''); } });

    // ==========================================
    // VIEWPORT RESPONSIVE ZOOM SCALING
    // ==========================================
    $('.dt-zoom-btn').on('click', function(e) {
        e.preventDefault();
        $('.dt-zoom-btn').removeClass('active');
        $(this).addClass('active');

        const zoomMode = $(this).data('zoom');
        const containerWidth = $('.iframe-container-mask').width();
        const containerHeight = $('.iframe-container-mask').height();

        if (zoomMode === 'responsive') {
            const targetDesktopWidth = 1280;
            const scaleRatio = containerWidth / targetDesktopWidth;
            $iframeWrapper.css({ 'width': targetDesktopWidth + 'px', 'height': (containerHeight / scaleRatio) + 'px', 'transform': 'scale(' + scaleRatio + ')' });
        } else {
            const scaleVal = parseFloat(zoomMode);
            $iframeWrapper.css({ 'width': (100 / scaleVal) + '%', 'height': (100 / scaleVal) + '%', 'transform': 'scale(' + scaleVal + ')' });
        }
    });

    // ==========================================
    // FOCUS MODE / SIDEBAR TOGGLE
    // ==========================================
    $sidebarToggle.on('click', function(e) {
        e.preventDefault();
        $body.toggleClass('docktree-focus-mode');
        $(this).toggleClass('button-primary');
        const isFocusActive = $body.hasClass('docktree-focus-mode');
        localStorage.setItem('docktree_focus_mode', isFocusActive ? 'active' : 'inactive');
        setTimeout(() => { const activeZoomBtn = $('.dt-zoom-btn.active'); if (activeZoomBtn.length) activeZoomBtn.trigger('click'); }, 100);
    });

    // ==========================================
    // NON-DESTRUCTIVE ASYNCHRONOUS SAVE WRAPPERS
    // ==========================================
    function saveLayoutAsync(callback) {
        const $statusMsg = $('#dt-runtime-status');
        $statusMsg.text('Saving layout structures...').css({'background': '#f59e0b', 'color': '#fff'});
        $savePageBtn.attr('disabled', 'disabled');

        $.ajax({
            url: docktreeData.ajaxUrl,
            type: 'POST',
            data: {
                action: 'docktree_save_post_async',
                post_id: docktreeData.postId,
                nonce: docktreeData.saveNonce,
                content: $dtTextarea.val()
            },
            success: function(response) {
                $savePageBtn.removeAttr('disabled');
                if (response.success) {
                    $statusMsg.text('Layout Saved Successfully').css({'background': '#10b981', 'color': '#fff'});
                    setTimeout(() => { $statusMsg.text('Docktree Sandbox Active').css({'background': '', 'color': ''}); }, 2500);
                    if (typeof callback === 'function') callback();
                } else {
                    $statusMsg.text('Error Saving Content').css({'background': '#ef4444', 'color': '#fff'});
                }
            },
            error: function() {
                $savePageBtn.removeAttr('disabled');
                $statusMsg.text('Server Communication Failure').css({'background': '#ef4444', 'color': '#fff'});
            }
        });
    }

    $savePageBtn.on('click', function(e) {
        e.preventDefault();
        saveLayoutAsync();
    });

    $previewPageBtn.on('click', function(e) {
        e.preventDefault();
        var html = $dtTextarea.val();
        var iframeDoc = $iframe[0].contentDocument;
        iframeDoc.open();
        iframeDoc.write(html);
        iframeDoc.close();
    });
});
var dmp = console.log;