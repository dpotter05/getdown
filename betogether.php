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
        $image_url_array =  betogether_get_array_from_string( ["image_url_string" => $atts["image_urls"]] );
        $result = betogether_get_html( ["image_url_array" => $image_url_array] );
        return $result;
    }
}

if ( !function_exists( 'betogether_get_html' ) ) {
    function betogether_get_html( $args ) {
        $result = betogether_get_slides( $args );
        $result = betogether_add_slider_container( $result );
        return $result;
    }
}

if ( !function_exists( 'betogether_add_slider_container' ) ) {
    function betogether_add_slider_container( $slide_html ) {
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

if ( !function_exists( 'betogether_get_slides' ) ) {
    function betogether_get_slides( $args ) {
        $result = "";
        $array = ( !empty( $args["image_url_array"] ) ) ? $args["image_url_array"] : "";
        if (!empty( $array ) && is_array( $array ) && count( $array ) > 0 ) {
            for ( $i = 0; $i < count( $array ); $i++ ) {
                $result .= betogether_get_image_tag_and_container( ["image_url" => $array[$i], "count" => $i] );
            }
        }
        return $result;
    }
}

if ( !function_exists( 'betogether_get_image_tag_and_container' ) ) {
    function betogether_get_image_tag_and_container( $args ) {
        $result = "";
        $image_url = ( !empty( $args["image_url"] ) && is_string( $args["image_url"] ) ) ? $args["image_url"] : "";
        $offCSS = ( $args["count"] === 0 ) ? "" : " off";
        if ( !empty( $image_url ) ) {
            $image_url = trim( esc_url( $image_url ) );
            $result .= <<<HERE
        <div class="betogether-slide{$offCSS}">
            <img src="{$image_url}" alt="Image Description" />
        </div>

HERE;
        }
        return $result;
    }
}

if ( !function_exists( 'betogether_get_array_from_string' ) ) {
    function betogether_get_array_from_string( $args ) {
        $result = "";
        $string = ( !empty( $args["image_url_string"] ) && is_string( $args["image_url_string"] ) ) ? sanitize_text_field( $args["image_url_string"] ) : "";
        if ( is_string( $string ) ) {
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