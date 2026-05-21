<?php
if (!defined('ABSPATH')) exit;

// Load active theme design framework assets cleanly
get_header();
?>

<div id="docktree-canvas-wrapper" style="min-height: 55vh; padding: 30px 0; background: rgba(0,0,0,0.01); position: relative;">
    <div id="docktree-canvas-root" class="container"></div>
</div>

<?php
// Load standard theme footers and scripts
get_footer();
?>