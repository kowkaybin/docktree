<?php
if (!defined('ABSPATH')) exit;

// Load active theme design framework assets cleanly
get_header();
?>

<div id="docktree-canvas-wrapper" style="min-height: 55vh; padding: 30px 0; background: rgba(0,0,0,0.01); position: relative;">
    <div id="docktree-canvas-root" class="container"></div>
</div>

<script>
(function() {
    function inject() {
        var root = document.getElementById('docktree-canvas-root');
        if (root && window.opener && typeof window.opener.dtPreviewContent === 'string') {
            root.innerHTML = window.opener.dtPreviewContent;
        }
    }
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
    } else {
        inject();
    }
})();
</script>

<?php
get_footer();
?>