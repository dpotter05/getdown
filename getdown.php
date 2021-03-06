<?php
/**
 * Plugin Name: Get Down Polaroid Slider
 * Author: David Potter
 * Author URI: https://github.com/dpotter05/getdown
 * Text Domain: getdown
 * Description: A lightweight slider with an option to turn your slides into polaroid pictures.
 * Version: 1.0
 * License: GPL2
 */

defined( 'ABSPATH' ) or die( "You can't access this file directly." );

add_action( 'init', 'getdown_enqueue_scripts' );
function getdown_enqueue_scripts() {
    wp_enqueue_style( 'getdown_scss-style', plugins_url() . '/getdown/css/getdown.css', false, '1.0.0', 'all' );
    wp_register_script( 'getdown_js', WP_PLUGIN_URL . '/getdown/js/getdown.js', array(), 1, false );
    wp_enqueue_script( 'getdown_js' );
}

if ( !function_exists( 'getdown_shortcode' ) ) {
    add_shortcode( 'getdown', 'getdown_shortcode' );
    function getdown_shortcode( $atts ) {
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
                'polaroid_style' => '',
                'polaroid-style-width' => '',
            ), 
            $atts, 
            'getdown'
        );
        $result = getdown_get_html( $atts );
        return $result;
    }
}

if ( !function_exists( 'getdown_get_html' ) ) {
    function getdown_get_html( $atts ) {
        $arrays = getdown_convert_input_strings_to_arrays( $atts );
        //$slider_container_css = ( $arrays['pause_on_mouseover'][0] === 'yes' ) ? 'pause-on-mouseover' : '';
        $slider_container_css = ( $arrays['pause_when_viewing_another_tab'][0] === 'yes' ) ? 'pause_when_viewing_another_tab' : '';
        $slider_container_css .= ( $arrays['pause_on_scroll'][0] === 'yes' ) ? ' pause_on_scroll' : '';
        $slider_container_css .= ( getdown_polaroid_is_on( $arrays ) ) ? ' polaroid_style' : '';
        $polaroid_style_width = ( 
            getdown_polaroid_is_on( $arrays ) &&
            !empty($arrays['polaroid-style-width'][0])
        ) ? '--polaroid-style-width: ' . $arrays['polaroid-style-width'][0] . ';' : '';
        $slide_container = getdown_add_container(
            [
                'id'        => 'getdown-slide-container',
                'cssClass'  => '',
                'content'   => getdown_get_slides( $arrays ),
                'indent'    => 2,
                'element'   => 'div',
                'style'     => '',
            ]
        );
        $progress_bar_container = getdown_add_container(
            [
                'id'        => 'getdown-progress-bar-container',
                'cssClass'  => '',
                'content'   => getdown_get_progress_bar(),
                'indent'    => 2,
                'element'   => 'div',
                'style'     => '',
            ]
        );
        $controls_container = getdown_add_container(
            [
                'id'        => 'getdown-controls-container',
                'content'   => getdown_get_controls( $arrays ),
                'cssClass'  => '',
                'indent'    => 2,
                'element'   => 'div',
                'style'     => '',
            ]
        );
        $slider = getdown_add_container(
            [
                'id'        => 'getdown-container',
                'content'   => $slide_container . $progress_bar_container . $controls_container,
                'cssClass'  => $slider_container_css,
                'indent'    => 1,
                'element'   => 'aside',
                'style'     => $polaroid_style_width,
            ]
        );
        return $slider;
    }
}

if ( !function_exists( 'getdown_convert_input_strings_to_arrays' ) ) {
    function getdown_convert_input_strings_to_arrays( $atts ) {
        if ( !empty( $atts ) && is_array( $atts ) ) {
            foreach ( $atts as $key => $value ) {
                $args[$key] = getdown_get_array_from_string( [ 'string' => $atts[$key] ] );
                if ( $key == 'polaroid-style-width') {
                    $args[$key] = [ sanitize_text_field( $atts[$key] ) ];
                }
            }
        }
        return $args;
    }
}

if ( !function_exists( 'getdown_get_array_from_string' ) ) {
    function getdown_get_array_from_string( $args ) {
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

if ( !function_exists( 'getdown_get_slides' ) ) {
    function getdown_get_slides( $args ) {
        $result = '
';
        $image_urls = ( !empty( $args['image_urls'] ) ) ? $args['image_urls'] : '';
        $image_descriptions = ( !empty( $args['image_descriptions'] ) ) ? $args['image_descriptions'] : array();
        $messages = ( !empty( $args['messages'] ) ) ? $args['messages'] : array();
        $durations_in_milliseconds = ( !empty( $args['durations_in_milliseconds'] ) ) ? $args['durations_in_milliseconds'] : array();
        $polaroid_style = ( getdown_polaroid_is_on( $args ) ) ?
            getdown_get_polaroid_container() :
            '';
        if (!empty( $image_urls ) && is_array( $image_urls ) && count( $image_urls ) > 0 ) {
            for ( $i = 0; $i < count( $image_urls ); $i++ ) {
                $alt = ( !empty( $image_descriptions[$i] ) ) ? $image_descriptions[$i] : '';
                $message = ( !empty( $messages[$i] ) ) ? $messages[$i] : '';
                $result .= getdown_get_slide( 
                    [
                        'image_url' => $image_urls[$i], 
                        'count'     => $i,
                        'alt'       => $alt,
                        'message'   => $message,
                        'duration'  => $durations_in_milliseconds[$i],
                    ] );
            }
        }
        $result = ( getdown_polaroid_is_on( $args ) ) ? $result . $polaroid_style : $result;
        return $result;
    }
}

if ( !function_exists( 'getdown_polaroid_is_on' ) ) {
    function getdown_polaroid_is_on( $args ) {
        return ( !empty( $args['polaroid_style'] ) && $args['polaroid_style'][0] == "yes" ) ? true : false;
    }
}

if ( !function_exists( 'getdown_get_polaroid_container' ) ) {
    function getdown_get_polaroid_container() {
        return  getdown_add_container(
            [
                'id'        => 'getdown-polaroid-container',
                'content'   => '<img src="' . plugins_url() . '/getdown/img/polaroid.png" alt="Polaroid picture frame" />',
                'cssClass'  => '',
                'indent'    => 3,
                'element'   => 'div',
                'style'     => '',
            ]
        );
    }
}

if ( !function_exists( 'getdown_get_slide' ) ) {
    function getdown_get_slide( $args ) {
        $result = '';
        $image_url = ( !empty( $args['image_url'] ) && is_string( $args['image_url'] ) ) ? $args['image_url'] : '';
        if ( !empty( $image_url ) ) {
            $offCSS = ( $args['count'] === 0 ) ? '' : ' off';
            $count = ( is_numeric( $args['count'] ) ) ? $args['count'] + 1 : '';
            $image_url = trim( esc_url( $image_url ) );
            $alt = ( !empty($args['alt'] ) ) ? trim( sanitize_text_field( $args['alt'] ) ) : '';
            $message = ( !empty($args['message'] ) ) ? trim( sanitize_text_field( $args['message'] ) ) : '';
            $message = ( $message == '-' || $message == '' ) ? '' : '<p>' . $message . '</p>';
            $duration = ( !empty( $args['duration'] ) ) ? trim( $args['duration'] ) : '4000';
            $result .= <<<HERE
            <div id="getdown-slide-{$count}" class="getdown-slide{$offCSS}" data-duration="{$duration}">
                <img src="{$image_url}" alt="{$alt}" />
                {$message}
            </div>

HERE;
        }
        return $result;
    }
}

if ( !function_exists( 'getdown_get_progress_bar' ) ) {
    function getdown_get_progress_bar() {
        return <<<HERE

            <div id="getdown-progress-bar"></div>

HERE;
    }
}

if ( !function_exists( 'getdown_get_controls' ) ) {
    function getdown_get_controls( $args ) {
        $result = '
';
        $image_urls = ( !empty( $args['image_urls'] ) ) ? $args['image_urls'] : array();
        if (!empty( $image_urls ) && is_array( $image_urls ) && count( $image_urls ) > 0 ) {
            for ( $i = 0; $i < count( $image_urls ); $i++ ) {
                $count = $i + 1;
                $id = 'getdown-control-' . ( $i + 1 );
                $css_class = 'getdown-slide-button';
                $aria_pressed = ( $count === 1 ) ? 'true' : 'false';
                $data_slide = $count;
                $result .= <<<HERE
            <a href="#" id="{$id}" class="{$css_class}" data-slide="{$data_slide}" role="button" aria-pressed="{$aria_pressed}"></a>

HERE;
            }
        }
        $result .= getdown_get_pause_button();
        return $result;
    }
}

if ( !function_exists( 'getdown_get_pause_button' ) ) {
    function getdown_get_pause_button() {
        return <<<HERE
            <a href="#" id="getdown-pause-button" role="button" aria-pressed="false" data-last_pause_type="nonclick onload">
                <svg style="stroke:white; fill:white; stroke-opacity:1;stroke-linejoin:round;stroke-width:3.4;stroke-miterlimit:4;stroke-dasharray:none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet" version="1.1" viewBox="6.3 3.3 14.4 17.4"><path d="M8 5v14l11-7z"></path></svg>
            </a>

HERE;
    }
}

if ( !function_exists( 'getdown_add_container' ) ) {
    function getdown_add_container( $args ) {
        $result = '';
        $id = ( !empty( $args['id'] ) ) ? $args['id'] : '';
        $cssClass = ( !empty( $args['cssClass'] ) ) ? ' class="' . $args['cssClass'] . '"' : '';
        $content = ( !empty( $args['content'] ) ) ? rtrim( $args['content'] ) : '';
        $indent = ( !empty( $args['indent'] ) && is_numeric( $args['indent'] ) ) ? $args['indent'] : '';
        $element = ( !empty( $args['element'] ) && is_string( $args['element'] ) ) ? $args['element'] : '';
        $style = ( !empty( $args['style'] ) && is_string( $args['style'] ) ) ? ' style="' . $args['style'] . '"' : '';
        $tab = getdown_get_tab_indentation( $indent );
        if ( !empty( $content ) ) {
            $result .= <<<HERE

{$tab}<{$element} id="{$id}"{$cssClass}{$style}>{$content}
{$tab}</{$element}>
HERE;
        }
        return $result;
    }
}

if ( !function_exists( 'getdown_get_tab_indentation' ) ) {
    function getdown_get_tab_indentation( $tabNumber ) {
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