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

    // Setup Native WP Actions Bridge
    const $savePageBtn = $('#dt-save-page-btn');
    const $previewPageBtn = $('#dt-preview-page-btn');

    // Restore last Focus Mode state on initialization
    const lastFocusState = localStorage.getItem('docktree_focus_mode');
    if (lastFocusState === 'active') {
        $body.addClass('docktree-focus-mode');
        $sidebarToggle.addClass('button-primary');
    }

    // Sync database cache to editor workspace text area
    if ($wpTextarea.length && $dtTextarea.length) {
        $dtTextarea.val($wpTextarea.val());
    }

    // Load Frame Sandbox Environment
    if ($iframe.length) {
        $iframe.attr('src', docktreeData.previewUrl);
        $iframe.on('load', function() {
            updateDocktreePreview();

            // Recalculate zoom fitting if initializing directly into focus mode
            if ($body.hasClass('docktree-focus-mode')) {
                setTimeout(() => {
                    const activeZoomBtn = $('.dt-zoom-btn.active');
                    if (activeZoomBtn.length) activeZoomBtn.trigger('click');
                }, 150);
            }
        });
    }

    // Mirror updates back to the native WP hidden content field
    $dtTextarea.on('input propertychange change', function() {
        $wpTextarea.val($(this).val());
    });

    // Refresh Click Event
    $refreshBtn.on('click', function(e) {
        e.preventDefault();
        updateDocktreePreview();
    });

    // Shortcode Toggle Change Event
    $shortcodeToggle.on('change', function() {
        updateDocktreePreview();
    });

    // ==========================================
    // SHORTCODE PARSING & RENDER CONTROL
    // ==========================================
    function updateDocktreePreview() {
        const rawHTML = $dtTextarea.val();
        const iframeWindow = $iframe[0].contentWindow;
        const executeShortcodes = $shortcodeToggle.is(':checked');

        if (!iframeWindow) return;
        const iframeDoc = iframeWindow.document;
        const $canvasRoot = $(iframeDoc).find('#docktree-canvas-root');

        if (!$canvasRoot.length) return;

        // Visual opacity transition feedback
        $canvasRoot.css('opacity', '0.4');

        if (executeShortcodes) {
            // Server-side parsing pipeline via Admin AJAX
            $.post(docktreeData.ajaxUrl, {
                action: 'docktree_parse_content',
                content: rawHTML,
                shortcodes: 'true'
            }, function(response) {
                if (response.success) {
                    renderCanvas(response.data);
                } else {
                    renderCanvas(rawHTML);
                }
            });
        } else {
            // Lightweight instant rendering without server round-trip
            renderCanvas(rawHTML);
        }

        function renderCanvas(htmlContent) {
            $canvasRoot.html(htmlContent);
            $canvasRoot.css('opacity', '1');

            // Attach interactive mouse highlights inside viewport frame DOM Context
            $(iframeDoc).find('#docktree-canvas-root .row, #docktree-canvas-root [class*="col-"]').css({
                'cursor': 'pointer',
                'transition': 'all 0.15s ease'
            });

            $(iframeDoc).off('mouseenter mouseleave', '#docktree-canvas-root [class*="col-"]');
            $(iframeDoc).on('mouseenter', '#docktree-canvas-root [class*="col-"]', function(e) {
                e.stopPropagation();
                $(this).css('outline', '2px dashed #0073aa');
            }).on('mouseleave', '#docktree-canvas-root [class*="col-"]', function() {
                $(this).css('outline', 'none');
            });
        }
    }

    // ==========================================
    // INTERACTIVE LIVE PANEL RESIZING (DRAG SPLIT)
    // ==========================================
    let isDragging = false;

    $resizer.on('mousedown', function(e) {
        e.preventDefault();
        isDragging = true;
        $body.css('cursor', 'col-resize');
    });

    $(document).on('mousemove', function(e) {
        if (!isDragging) return;

        const containerOffsetLeft = $container.offset().left;
        const containerWidth = $container.width();
        const pointerRelativeX = e.pageX - containerOffsetLeft;

        let newWidthPercentage = (pointerRelativeX / containerWidth) * 100;
        if (newWidthPercentage < 15) newWidthPercentage = 15;
        if (newWidthPercentage > 60) newWidthPercentage = 60;

        $leftPanel.css('width', newWidthPercentage + '%');
    }).on('mouseup', function() {
        if (isDragging) {
            isDragging = false;
            $body.css('cursor', '');
        }
    });

    // ==========================================
    // VIEWPORT RESPONSIVE ZOOM SCALING
    // ==========================================
    $('.dt-zoom-btn').on('click', function() {
        $('.dt-zoom-btn').removeClass('active');
        $(this).addClass('active');

        const zoomMode = $(this).data('zoom');
        const containerWidth = $('.iframe-container-mask').width();
        const containerHeight = $('.iframe-container-mask').height();

        if (zoomMode === 'responsive') {
            const targetDesktopWidth = 1280;
            const scaleRatio = containerWidth / targetDesktopWidth;

            $iframeWrapper.css({
                'width': targetDesktopWidth + 'px',
                'height': (containerHeight / scaleRatio) + 'px',
                'transform': 'scale(' + scaleRatio + ')'
            });
        } else {
            const scaleVal = parseFloat(zoomMode);
            $iframeWrapper.css({
                'width': (100 / scaleVal) + '%',
                'height': (100 / scaleVal) + '%',
                'transform': 'scale(' + scaleVal + ')'
            });
        }
    });

    // ==========================================
    // FOCUS MODE / SIDEBAR TOGGLE
    // ==========================================
    $sidebarToggle.on('click', function(e) {
        e.preventDefault();
        $body.toggleClass('docktree-focus-mode');
        $(this).toggleClass('button-primary');

        // Save focus state locally
        const isFocusActive = $body.hasClass('docktree-focus-mode');
        localStorage.setItem('docktree_focus_mode', isFocusActive ? 'active' : 'inactive');

        // Fix resize alignment layout calculations inside canvas viewport
        setTimeout(() => {
            const activeZoomBtn = $('.dt-zoom-btn.active');
            if (activeZoomBtn.length) activeZoomBtn.trigger('click');
        }, 100);
    });

    // ==========================================
    // INTEGRATED PUBLISH / PREVIEW LIFECYCLE
    // ==========================================
    $savePageBtn.on('click', function(e) {
        e.preventDefault();
        // Trigger standard WordPress submission form pipeline
        $('#publish').trigger('click');
    });

    $previewPageBtn.on('click', function(e) {
        e.preventDefault();
        // Open live webpage inside a new tab cleanly
        const viewLink = $('#view-post-btn a').attr('href') || $('#sample-permalink a').attr('href');
        if (viewLink) {
            window.open(viewLink, '_blank');
        } else {
            // Fallback: Trigger standard WP preview button
            $('#post-preview').trigger('click');
        }
    });
});