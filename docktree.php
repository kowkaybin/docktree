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
            'postStatus' => get_post_status($post->ID),
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
    $post_data = array('ID' => $post_id, 'post_content' => $content);

    if (!empty($_POST['post_title'])) {
        $post_data['post_title'] = sanitize_text_field(wp_unslash($_POST['post_title']));
    }
    if (!empty($_POST['post_name'])) {
        $post_data['post_name'] = sanitize_title(wp_unslash($_POST['post_name']));
    }

    $updated_post = wp_update_post($post_data);

    if (is_wp_error($updated_post)) {
        wp_send_json_error($updated_post->get_error_message());
    }

    wp_send_json_success('Page layout definitions committed successfully.');
}

// AJAX handler for parsing shortcodes
add_action('wp_ajax_docktree_parse_content', 'docktree_parse_content_ajax');
function docktree_parse_content_ajax_basic() {
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

function docktree_parse_content_ajax() {
    if (!current_user_can('edit_posts')) {
        wp_send_json_error('Unauthorized');
    }

    if ( ! class_exists( 'WP_Block_Editor_Context' ) ) {
        require_once ABSPATH . 'wp-includes/class-wp-block-editor-context.php';
    }

    if ( ! function_exists( 'get_current_screen' ) ) {
        require_once ABSPATH . 'wp-admin/includes/screen.php';
    }

    $GLOBALS['current_screen'] = convert_to_screen( 'post' );
    $GLOBALS['current_screen']->is_block_editor( true );

    $content = isset($_POST['content']) ? wp_unslash($_POST['content']) : '';

    // Fix: Use your specific template part pattern here
    if ( preg_match_all( '//', $content, $matches ) ) {
        foreach ( $matches[1] as $index => $slug ) {
            ob_start();
            get_template_part( sanitize_text_field( $slug ) );
            $template_html = ob_get_clean();

            $content = str_replace( $matches[0][$index], $template_html, $content );
        }
    }

    if ( function_exists( 'do_blocks' ) ) {
        $content = do_blocks( $content );
    }

    if ( isset($_POST['shortcodes']) && $_POST['shortcodes'] === 'true' ) {
        $content = do_shortcode( $content );
    }

    // --- START TEMPLATE EMULATION ---

    // 1. Create a mock post object to satisfy the loop
    $mock_post = new WP_Post((object) array(
        'ID'             => -999, // Dummy ID
        'post_content'   => $content,
        'post_type'      => 'page',
        'post_status'    => 'publish',
        'filter'         => 'raw'
    ));
    // 2. Setup the global query variables
    global $wp_query, $post;
    $original_query = $wp_query;
    $original_post  = $post;

    // Force wp_query to think it found 1 post
    $wp_query = new WP_Query();
    $wp_query->posts = array($mock_post);
    $wp_query->post_count = 1;
    $wp_query->current_post = -1;
    $wp_query->in_the_loop = false;
    $wp_query->post = $mock_post;
    $post = $mock_post;

    // 3. Override the_content filter to return our compiled content
    $content_override = function() use ($content) {
        return $content;
    };
    add_filter('the_content', $content_override, 999);

    wp_deregister_script( 'jquery' ); // Crucial step for enabling $

    // 4. Capture the template execution
    ob_start();

    // locate_template falls back to default files if the posted template doesn't exist
    $posted_template = isset($_POST['template']) ? sanitize_text_field($_POST['template']) : '';
    $custom_template = locate_template(array($posted_template/*, 'page.php', 'index.php'*/));

    if ( $custom_template ) {
        // This now triggers have_posts() and the_post() successfully
        include $custom_template;
    } else {
        echo '<div class="bg-danger text-light text-center font-weight-medium">NO TEMPLATE SELECTED</div>';
        get_header();
        // echo $content;
        get_footer();

    }

    $full_page_preview = ob_get_clean();

    // // Dealing with the jquery script inside <HEAD> where WP loves to modify include path into /wp-admin/load-scripts.php?c=0&load%5Bchunk_0%5D=jquery-core,jquery-migrate&ver=5.9.2
    //     // This matches the exact script tag loading load-scripts.php
    //     $pattern = '/<script\s+src=[\'"]' . preg_quote(admin_url('load-scripts.php'), '/') . '[^>]*><\/script>/i';
    //     $full_page_preview = preg_replace($pattern, '', $full_page_preview);

    //     // Inject your local custom jQuery script manually if it was stripped or missed
    //     $my_jquery = "<script src='" . get_template_directory_uri() . "/js/vendor/jquery.min.js?ver=3.7.1'></script>\n";

    //     // Insert your clean jQuery right before the closing </head> or </body> tag
    //     if ( strpos($full_page_preview, '</head>') !== false ) {
    //         $full_page_preview = str_replace('</head>', $my_jquery . '</head>', $full_page_preview);
    //     } else {
    //         $full_page_preview = $my_jquery . $full_page_preview;
    //     }

    // 5. Restore original global states to prevent admin breakages
    remove_filter('the_content', $content_override, 999);
    $wp_query = $original_query;
    $post = $original_post;
    wp_reset_postdata();

    // --- END TEMPLATE EMULATION ---

    wp_send_json_success( $full_page_preview );
}

function docktree_render_preview_template($template) {
    // Search for your specific custom template file first
    $preview_template = locate_template(array('templates/preview-template.php', 'page.php', 'index.php'));

    if ($preview_template) {
        add_filter('the_content', 'docktree_inject_preview_content');
        return $preview_template;
    }

    return $template;
}

function docktree_inject_preview_content($default_content) {
    global $docktree_preview_content;

    $content = $docktree_preview_content;

    // Run your block and shortcode parsing logic here
    if (function_exists('do_blocks')) {
        $content = do_blocks($content);
    }
    if (isset($_POST['shortcodes']) && $_POST['shortcodes'] === 'true') {
        $content = do_shortcode($content);
    }

    return $content;
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