<?php
/**
 * Plugin Name: Be Together Slider
 * Author: David Potter
 * Author URI: https://github.com/dpotter05/
 * Text Domain: betogether
 * Description: Bare bones slider
 * Version: 1.0
 * License: GPL2
 */

defined( "ABSPATH" ) or die( "You can't access this file directly." );

add_action( "init", "betogether_enqueue_scripts" );
function betogether_enqueue_scripts() {
  wp_enqueue_style( "betogether-style", plugins_url() . "/betogether/css/betogether.css", false, "1.0.0", "all" );
  wp_register_script( "betogether_js", WP_PLUGIN_URL . "/betogether/js/betogether.js", array(), 1, false );
  wp_enqueue_script( "betogether_js" );
}

 ?>