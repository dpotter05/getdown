<?php
/**
 * Plugin Name: Be Together Slider
 * Author: David Potter
 * Author URI: https://github.com/dpotter05/
 * Text Domain: betogether
 * Description: A bare-bones shortcode slider
 * Version: 1.0
 * License: GPL2
 */

defined( 'ABSPATH' ) or die( "You can't access this file directly." );

add_action( 'init', 'betogether_enqueue_scripts' );
function betogether_enqueue_scripts() {
    wp_enqueue_style( 'betogether-style', plugins_url() . '/betogether/css/betogether.css', false, '1.0.0', 'all' );
    wp_register_script( 'betogether_js', WP_PLUGIN_URL . '/betogether/js/betogether.js', array(), 1, false );
    wp_enqueue_script( 'betogether_js' );
}

if ( !function_exists( 'betogether_shortcode' ) ) {
    add_shortcode( 'betogether', 'betogether_shortcode' );
    function betogether_shortcode( $atts ) {
        $result = '';
        $atts = shortcode_atts(
            array(
                'image_urls'  => '',
                'image_descriptions' => '',
                'messages' => '',
            ), 
            $atts, 
            'betogether'
        );
        $args = betogether_convert_atts_strings_to_args_arrays( $atts );
        $result = betogether_get_html( $args );
        return $result;
    }
}

if ( !function_exists( 'betogether_convert_atts_strings_to_args_arrays' ) ) {
    function betogether_convert_atts_strings_to_args_arrays( $atts ) {
        if ( !empty( $atts ) && is_array( $atts ) ) {
            foreach ( $atts as $key => $value ) {
                $args[$key] = betogether_get_array_from_string( [ 'string' => $atts[$key] ] );
            }
        }
        return $args;
    }
}

if ( !function_exists( 'betogether_get_array_from_string' ) ) {
    function betogether_get_array_from_string( $args ) {
        $result = '';
        $string = ( !empty( $args['string'] ) && is_string( $args['string'] ) ) ? sanitize_text_field( $args['string'] ) : '';
        if ( is_string( $string ) ) {
            if ( strpos( $string, ',' ) !== false ) {
                $result = explode( ',', $string );
            } else {
                $result = array( $string );
            }
        }
        return $result;
    }
}

if ( !function_exists( 'betogether_get_html' ) ) {
    function betogether_get_html( $args ) {
        $slide_container = betogether_add_container( 
            [
                'id' => 'betogether-slide-container',
                'content' => betogether_get_slides( $args ),
                'indent' => 2,
            ]
        );
        $controls_container = betogether_add_container( 
            [
                'id' => 'betogether-controls-container',
                'content' => betogether_get_controls( $args ),
                'indent' => 2,
            ]
        );
        $slider = betogether_add_container( 
            [
                'id' => 'betogether-container',
                'content' => $slide_container . $controls_container,
                'indent' => 1,
            ]
        );
        return $slider;
    }
}

if ( !function_exists( 'betogether_get_slides' ) ) {
    function betogether_get_slides( $args ) {
        $result = '
';
        $image_urls = ( !empty( $args['image_urls'] ) ) ? $args['image_urls'] : '';
        $image_descriptions = ( !empty( $args['image_descriptions'] ) ) ? $args['image_descriptions'] : array();
        $messages = ( !empty( $args['messages'] ) ) ? $args['messages'] : array();
        if (!empty( $image_urls ) && is_array( $image_urls ) && count( $image_urls ) > 0 ) {
            for ( $i = 0; $i < count( $image_urls ); $i++ ) {
                $alt = ( !empty( $image_descriptions[$i] ) ) ? $image_descriptions[$i] : '';
                $result .= betogether_get_slide( 
                    [
                        'image_url' => $image_urls[$i], 
                        'count' => $i,
                        'alt' => $alt,
                        'message' => $messages[$i],
                    ] );
            }
        }
        return $result;
    }
}

if ( !function_exists( 'betogether_get_slide' ) ) {
    function betogether_get_slide( $args ) {
        $result = '';
        $image_url = ( !empty( $args['image_url'] ) && is_string( $args['image_url'] ) ) ? $args['image_url'] : '';
        if ( !empty( $image_url ) ) {
            $offCSS = ( $args['count'] === 0 ) ? '' : ' off';
            $count = ( is_numeric( $args['count'] ) ) ? $args['count'] + 1 : '';
            $image_url = trim( esc_url( $image_url ) );
            $alt = ( !empty($args['alt'] ) ) ? trim( sanitize_text_field( $args['alt'] ) ) : '';
            $message = ( !empty($args['message'] ) ) ? $args['message'] : '';
            $result .= <<<HERE
            <div id="betogether-slide-{$count}" class="betogether-slide{$offCSS}">
                <img src="{$image_url}" alt="{$alt}" />
                <p>{$message}</p>
            </div>

HERE;
        }
        return $result;
    }
}

if ( !function_exists( 'betogether_get_controls' ) ) {
    function betogether_get_controls( $args ) {
        $result = '
';
        $image_urls = ( !empty( $args['image_urls'] ) ) ? $args['image_urls'] : array();
        if (!empty( $image_urls ) && is_array( $image_urls ) && count( $image_urls ) > 0 ) {
            for ( $i = 0; $i < count( $image_urls ); $i++ ) {
                $count = $i + 1;
                $id = 'betogether-control-' . ( $i + 1 );
                $css_class = 'betogether-control';
                $aria_pressed = ( $count === 1 ) ? 'true' : 'false';
                $data_slide = 'betogether-slide-' . $count;
                $result .= <<<HERE
            <a href="#" id="{$id}" class="{$css_class}" role="button" aria-pressed="{$aria_pressed}" data-slide="{$data_slide}"></a>

HERE;
            }
        }
        return $result;
    }
}

if ( !function_exists( 'betogether_add_container' ) ) {
    function betogether_add_container( $args ) {
        $result = '';
        $id = ( !empty( $args['id'] ) ) ? $args['id'] : '';
        $content = ( !empty( $args['content'] ) ) ? rtrim( $args['content'] ) : '';
        $indent = ( !empty( $args['indent'] ) && is_numeric( $args['indent'] ) ) ? $args['indent'] : '';
        $tab = betogether_get_tab_indentation( $indent );
        if ( !empty( $content ) ) {
            $result .= <<<HERE

{$tab}<div id="{$id}">{$content}
{$tab}</div>
HERE;
        }
        return $result;
    }
}

if ( !function_exists( 'betogether_get_tab_indentation' ) ) {
    function betogether_get_tab_indentation( $tabNumber ) {
        $result = '';
        $tab = <<<HERE
    
HERE;
        if ( !empty( $tabNumber ) && is_numeric( $tabNumber )) {
            for ( $i = 0; $i < $tabNumber; $i++ ) {
                $result .= $tab;
            }
        }
        return $result;
    }
}

?>