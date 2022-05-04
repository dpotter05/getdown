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
    wp_enqueue_style( 'betogether_scss-style', plugins_url() . '/betogether/css/betogether_scss.css', false, '1.0.0', 'all' );
    wp_register_script( 'betogether_js', WP_PLUGIN_URL . '/betogether/js/betogether.js', array(), 1, false );
    wp_enqueue_script( 'betogether_js' );
}

if ( !function_exists( 'betogether_shortcode' ) ) {
    add_shortcode( 'betogether', 'betogether_shortcode' );
    function betogether_shortcode( $atts ) {
        $result = '';
        $atts = shortcode_atts(
            array(
                'image_urls' => '',
                'image_descriptions' => '',
                'messages' => '',
                'durations_in_milliseconds' => '',
                'pause_on_mouseover' => '',
                'pause_when_viewing_another_tab' => '',
                'pause_on_scroll' => '',
            ), 
            $atts, 
            'betogether'
        );
        $result = betogether_get_html( $atts );
        return $result;
    }
}

if ( !function_exists( 'betogether_get_html' ) ) {
    function betogether_get_html( $atts ) {
        $arrays = betogether_convert_input_strings_to_arrays( $atts );
        $sliderContainerCSS = ( $arrays['pause_on_mouseover'][0] === 'yes' ) ? 'pause-on-mouseover' : '';
        $sliderContainerCSS .= ( $arrays['pause_when_viewing_another_tab'][0] === 'yes' ) ? ' pause_when_viewing_another_tab' : '' ;
        $sliderContainerCSS .= ( $arrays['pause_on_scroll'][0] === 'yes' ) ? ' pause_on_scroll' : '' ;
        $slide_container = betogether_add_container(
            [
                'id'        => 'betogether-slide-container',
                'cssClass'  => '',
                'content'   => betogether_get_slides( $arrays ),
                'indent'    => 2,
            ]
        );
        $progress_bar_container = betogether_add_container(
            [
                'id'        => 'betogether-progress-bar-container',
                'cssClass'  => '',
                'content'   => betogether_get_progress_bar(),
                'indent'    => 2,
            ]
        );
        $controls_container = betogether_add_container(
            [
                'id'        => 'betogether-controls-container',
                'content'   => betogether_get_controls( $arrays ),
                'cssClass'  => '',
                'indent'    => 2,
            ]
        );
        $slider = betogether_add_container(
            [
                'id'        => 'betogether-container',
                'content'   => $slide_container . $progress_bar_container . $controls_container,
                'cssClass'  => $sliderContainerCSS,
                'indent'    => 1,
            ]
        );
        return $slider;
    }
}

if ( !function_exists( 'betogether_convert_input_strings_to_arrays' ) ) {
    function betogether_convert_input_strings_to_arrays( $atts ) {
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

if ( !function_exists( 'betogether_get_slides' ) ) {
    function betogether_get_slides( $args ) {
        $result = '
';
        $image_urls = ( !empty( $args['image_urls'] ) ) ? $args['image_urls'] : '';
        $image_descriptions = ( !empty( $args['image_descriptions'] ) ) ? $args['image_descriptions'] : array();
        $messages = ( !empty( $args['messages'] ) ) ? $args['messages'] : array();
        $durations_in_milliseconds = ( !empty( $args['durations_in_milliseconds'] ) ) ? $args['durations_in_milliseconds'] : array();
        if (!empty( $image_urls ) && is_array( $image_urls ) && count( $image_urls ) > 0 ) {
            for ( $i = 0; $i < count( $image_urls ); $i++ ) {
                $alt = ( !empty( $image_descriptions[$i] ) ) ? $image_descriptions[$i] : '';
                $result .= betogether_get_slide( 
                    [
                        'image_url' => $image_urls[$i], 
                        'count'     => $i,
                        'alt'       => $alt,
                        'message'   => $messages[$i],
                        'duration'  => $durations_in_milliseconds[$i],
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
            $message = ( !empty($args['message'] ) ) ? trim( sanitize_text_field( $args['message'] ) ) : '';
            $message = ( $message == '-' ) ? "" : '<p>' . $message . '</p>';
            $duration = ( !empty( $args['duration'] ) ) ? trim( $args['duration'] ) : '4000';
            $result .= <<<HERE
            <div id="betogether-slide-{$count}" class="betogether-slide{$offCSS}" data-duration="{$duration}">
                <img src="{$image_url}" alt="{$alt}" />
                {$message}
            </div>

HERE;
        }
        return $result;
    }
}

if ( !function_exists( 'betogether_get_progress_bar' ) ) {
    function betogether_get_progress_bar() {
        return <<<HERE

            <div id="betogether-progress-bar"></div>

HERE;
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
                $css_class = 'betogether-slide-button';
                $aria_pressed = ( $count === 1 ) ? 'true' : 'false';
                $data_slide = $count;
                $result .= <<<HERE
            <a href="#" id="{$id}" class="{$css_class}" data-slide="{$data_slide}" role="button" aria-pressed="{$aria_pressed}"></a>

HERE;
            }
        }
        $result .= betogether_get_pause_button();
        return $result;
    }
}

if ( !function_exists( 'betogether_get_pause_button' ) ) {
    function betogether_get_pause_button() {
        return <<<HERE
            <a href="#" id="betogether-pause-button" role="button" aria-pressed="false" data-last_pause_type="nonclick onload">
                <svg style="stroke:white; fill:white; stroke-opacity:1;stroke-linejoin:round;stroke-width:3.4;stroke-miterlimit:4;stroke-dasharray:none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" version="1.1" viewBox="6.3 3.3 14.4 17.4"><path d="M8 5v14l11-7z"></path></svg>
            </a>

HERE;
    }
}

if ( !function_exists( 'betogether_add_container' ) ) {
    function betogether_add_container( $args ) {
        $result = '';
        $id = ( !empty( $args['id'] ) ) ? $args['id'] : '';
        $cssClass = ( !empty( $args['cssClass'] ) ) ? ' class="' . $args['cssClass'] . '"' : '';
        $content = ( !empty( $args['content'] ) ) ? rtrim( $args['content'] ) : '';
        $indent = ( !empty( $args['indent'] ) && is_numeric( $args['indent'] ) ) ? $args['indent'] : '';
        $tab = betogether_get_tab_indentation( $indent );
        if ( !empty( $content ) ) {
            $result .= <<<HERE

{$tab}<div id="{$id}"{$cssClass}>{$content}
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