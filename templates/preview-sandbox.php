<?php
if (!defined('ABSPATH')) exit;

get_header();
?>

<div id="docktree-canvas-wrapper" class="site-main" style="min-height: 55vh; position: relative;">
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

<?php get_footer(); ?>
