<?php
/**
 * Plugin Name: Docktree
 * Description: Lightweight DOM-first layout engine with side-by-side isolated preview, interactive panel scaling, nestable grids, and interactive widgets.
 * Version: 1.0.0
 * Author: Kay Bin (vibe Gemini 20260521)
 */

if (!defined('ABSPATH')) exit;

define('DOCKTREE_PATH', plugin_dir_path(__FILE__));
define('DOCKTREE_URL', plugin_dir_url(__FILE__));

// Enqueue Admin Assets
add_action('admin_enqueue_scripts', 'docktree_admin_assets');
function docktree_admin_assets($hook) {
    global $post_type, $post;
    if (in_array($hook, array('post.php', 'post-new.php')) && $post_type === 'page') {
        wp_enqueue_script('sortable-js', 'https://cdn.jsdelivr.net/npm/sortablejs@1.15.2/Sortable.min.js', array(), '1.15.2', true);

        wp_enqueue_script('jquery-ui-core');
        wp_enqueue_script('jquery-ui-widget');
        wp_enqueue_script('jquery-ui-mouse');

        // Separated file dedicated to handling the jQuery UI widgets
        wp_enqueue_script('docktree-widgets-js', DOCKTREE_URL . 'assets/js/widgets.js', array('jquery', 'jquery-ui-widget'), '1.5.0', true);

        wp_enqueue_style('docktree-admin-css', DOCKTREE_URL . 'assets/css/admin-style.css', array(), '1.5.0');
        wp_enqueue_style('docktree-widgets-css', DOCKTREE_URL . 'assets/css/widgets.css', array('docktree-admin-css'), '1.5.0');
        wp_enqueue_script('docktree-admin-js', DOCKTREE_URL . 'assets/js/editor.js', array('jquery', 'sortable-js', 'docktree-widgets-js'), '1.5.0', true);

        wp_localize_script('docktree-admin-js', 'docktreeData', array(
            'previewUrl' => add_query_arg('docktree_preview', '1', get_permalink()),
            'ajaxUrl'    => admin_url('admin-ajax.php'),
            'postId'     => $post->ID,
            'saveNonce'  => wp_create_nonce('update-post_' . $post->ID)
        ));
    }
}

// Register Meta Box
add_action('add_meta_boxes', 'docktree_register_metabox');
function docktree_register_metabox() {
    add_meta_box(
        'docktree-editor-box',
        __('Docktree Engine Workspace', 'docktree'),
        'docktree_render_callback',
        'page',
        'normal',
        'high'
    );
}

function docktree_render_callback($post) {
    if (file_exists(DOCKTREE_PATH . 'includes/editor-ui.php')) {
        include_once(DOCKTREE_PATH . 'includes/editor-ui.php');
    }
}

// AJAX handler for background non-destructive saving
add_action('wp_ajax_docktree_save_post_async', 'docktree_save_post_async_callback');
function docktree_save_post_async_callback() {
    $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;

    if (!$post_id || !current_user_can('edit_page', $post_id)) {
        wp_send_json_error('Unauthorized permissions.');
    }

    check_ajax_referer('update-post_' . $post_id, 'nonce');

    $content = isset($_POST['content']) ? wp_unslash($_POST['content']) : '';

    $updated_post = wp_update_post(array(
        'ID'           => $post_id,
        'post_content' => $content
    ));

    if (is_wp_error($updated_post)) {
        wp_send_json_error($updated_post->get_error_message());
    }

    wp_send_json_success('Page layout definitions committed successfully.');
}

// AJAX handler for parsing shortcodes
add_action('wp_ajax_docktree_parse_content', 'docktree_parse_content_ajax');
function docktree_parse_content_ajax() {
    if (!current_user_can('edit_posts')) {
        wp_send_json_error('Unauthorized');
    }

    $content = isset($_POST['content']) ? wp_unslash($_POST['content']) : '';
    $execute_shortcodes = isset($_POST['shortcodes']) && $_POST['shortcodes'] === 'true';

    if ($execute_shortcodes) {
        $content = do_shortcode($content);
    }

    wp_send_json_success($content);
}

// Hijack frontend template for the isolated workspace preview
add_action('template_redirect', 'docktree_render_preview_sandbox');
function docktree_render_preview_sandbox() {
    if (isset($_GET['docktree_preview']) && current_user_can('edit_posts')) {
        if (file_exists(DOCKTREE_PATH . 'templates/preview-sandbox.php')) {
            include(DOCKTREE_PATH . 'templates/preview-sandbox.php');
            exit;
        }
    }
}

// Disable Gutenberg Block Editor completely for standard Pages
add_filter('use_block_editor_for_post_type', 'docktree_disable_gutenberg', 10, 2);
function docktree_disable_gutenberg($current_status, $post_type) {
    if ($post_type === 'page') {
        return false;
    }
    return $current_status;
}