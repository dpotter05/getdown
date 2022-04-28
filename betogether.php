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

if ( !function_exists( 'betogether_shortcode' ) ) {
    add_shortcode( "betogether", "betogether_shortcode" );
    function betogether_shortcode( $atts ) {
        $result = "";
        $atts = shortcode_atts(
            array(
                "image_urls"  => "",
            ), 
            $atts, 
            "betogether"
        );
        $image_url_array =  betogether_get_array_from_string( sanitize_text_field( $atts["image_urls"] ) );
        $result = betogether_get_html( $image_url_array );
        return $result;
    }
}

if ( !function_exists( 'betogether_get_html' ) ) {
    function betogether_get_html( $array ) {
        $result = "";
        if (!empty( $array ) && is_array( $array ) && count( $array ) > 0) {
            for ( $i = 0; $i < count( $array ); $i++ ) {
                $result .= betogether_add_slide_html( $array[$i] );
            }
        }
        $result = betogether_add_slider_container_html( $result );
        return $result;
    }
}

if ( !function_exists( 'betogether_add_slider_container_html' ) ) {
    function betogether_add_slider_container_html( $slide_html ) {
        $result = "";
        if ( !empty( $slide_html ) ) {
            $result .= <<<HERE

    <div class="betogether-slide-container">
{$slide_html}
    </div>
HERE;
        }
        return $result;
    }
}

if ( !function_exists( 'betogether_add_slide_html' ) ) {
    function betogether_add_slide_html( $image_url ) {
        $result = "";
        if ( !empty( $image_url ) ) {
            $result .= <<<HERE
        <div class="betogether-slide">
            <img src="{$image_url}" alt="Image Description" />
        </div>

HERE;
        }
        return $result;
    }
}


if ( !function_exists( 'betogether_get_array_from_string' ) ) {
    function betogether_get_array_from_string( $string ) {
        $result = "";
        if ( !empty( $string ) && is_string( $string ) ) {
            if ( strpos( $string, "," ) !== false ) {
                $result = explode( ",", $string );
            } else {
                $result = array( $string );
            }
        }
        return $result;
    }
}

 ?>