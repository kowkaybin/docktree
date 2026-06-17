<?php
if (!defined('ABSPATH')) exit;

get_header();

$canvas_html = apply_filters(
    'docktree_preview_canvas',
    '<div id="docktree-canvas-root" class="container"></div>',
    get_post_type()
);
?>

<div id="docktree-canvas-wrapper" class="site-main" style="min-height: 55vh; position: relative;">
    <?php echo $canvas_html; ?>
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
