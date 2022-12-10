<?php

/**
 * Plugin Name: Get Down Polaroid Slider
 * Author: David Potter
 * Author URI: https://github.com/dpotter05/getdown
 * Text Domain: getdown
 * Description: A lightweight slider with an option to turn your slides into polaroid pictures.
 * Version: 1.1
 * License: GPL2
 */

namespace getdown;

defined( 'ABSPATH' ) or die( "Access unavailable" );

require_once 'includes/class-tools.php';
require_once 'includes/class-slider-template.php';
require_once 'includes/class-slide-template.php';
require_once 'includes/class-control-button-template.php';

add_action( 'init', '\getdown\enqueue_scripts' );
function enqueue_scripts() {
    wp_enqueue_style( 'getdown_scss-style', plugins_url() . '/getdown/css/getdown.css', false, '1.0.0', 'all' );
    wp_register_script( 'getdown_js', WP_PLUGIN_URL . '/getdown/js/getdown.js', array(), 1, false );
    wp_enqueue_script( 'getdown_js' );
}

add_shortcode( 'getdown', '\getdown\shortcode' );
function shortcode( $atts ) {
    $result = '';
    $atts = shortcode_atts(
        array(
            'image_urls' => '',
            'image_descriptions' => '',
            'messages' => '',
            'durations_in_milliseconds' => '',
            'pause_when_viewing_another_tab' => '',
            'pause_on_scroll' => '',
            'polaroid_style' => '',
            'polaroid-style-width' => '',
        ), 
        $atts, 
        'getdown'
    );
    $slider = new Slider( $atts );
    return $slider->html();
}

class Slider {
    function __construct( $atts ) {
        $this->config_arrays = tools\Tools::convert_input_strings_to_arrays( $atts );
        $this->set_css();
        $this->set_content();
    }
    public function set_css() {
        $pause_on_tab = 'pause_when_viewing_another_tab';
        $this->cssClass = ( $this->config_arrays[ $pause_on_tab ][0] === 'yes' ) ? $pause_on_tab : '';
        $this->cssClass .= ( $this->config_arrays['pause_on_scroll'][0] === 'yes' ) ? ' pause_on_scroll' : '';
        $this->cssClass .= ( Polaroid_style::on( $this->config_arrays ) ) ? ' polaroid_style' : '';
        $this->polaroid_width = Polaroid_style::set_width( $this->config_arrays );
    }
    public function set_content() {
        $slide_content = new Slide_content( $this->config_arrays );
        $this->slide = $slide_content->html();
        $control_content = new Control_content( $this->config_arrays );
        $this->controls = $control_content->html();
    }
    public function html() {
        $template = new slider\Slider_template( [
            'slide'     => $this->slide,
            'controls'  => $this->controls,
            'cssClass'  => $this->cssClass,
            'style'     => $this->polaroid_width,
        ] );
        return $template->html();
    }
}

class Polaroid_style {
    public static function on( $args ) {
        return ( !empty( $args['polaroid_style'] ) && $args['polaroid_style'][0] == 'yes' ) ? true : false;
    }
    public static function set_width( $config_arrays ) {
        $result = '';
        if ( self::on( $config_arrays ) && is_array( $config_arrays['polaroid-style-width'] ) ) {
            $polaroid_array = $config_arrays['polaroid-style-width'];
            $polaroid_width = ( count( $polaroid_array ) === 1 ) ? $polaroid_array[0] : implode( ',', $polaroid_array );
            $result = '--polaroid-style-width: ' . $polaroid_width . ';';
            return $result;
        }
    }
}

class Slide_content {
    function __construct( $config_arrays ) {
        $this->config_arrays = $config_arrays;
        $this->values = tools\Tools::emptyCheckArrayWithDefaults( $config_arrays, [
            'image_urls'                => '',
            'image_descriptions'        => array(),
            'messages'                  => array(),
            'durations_in_milliseconds' => array()
        ] );
    }
    public function attr( $attr ) {
        $result = [];
        foreach ( $attr as $key => $value ) {
            $result += [ $key => $value ];
        }
        return $result;
    }
    public function slide_html( $attr ) {
        $slide = new slide\Slide_template( $this->attr( $attr ) );
        return $slide->html();
    }
    public function html() {
        $values = $this->values;
        $result = '';
        if ( tools\Tools::array_has_values( $values['image_urls'] ) ) {
            for ( $i = 0; $i < count( $values['image_urls'] ); $i++ ) {
                $result .= $this->slide_html( [
                    'alt'       => tools\Tools::emptyCheck( $values['image_descriptions'][$i], '' ),
                    'message'   => tools\Tools::emptyCheck( $values['messages'][$i], '' ),
                    'duration'  => tools\Tools::emptyCheck( $values['durations_in_milliseconds'][$i], '' ),
                    'image_url' => tools\Tools::clean_url( $values['image_urls'][$i] ),
                    'count'     => $i,
                ] );
            }
        }
        return $result;
    }
}

class Control_content {
    function __construct( $config_arrays ) {
        $this->image_urls = $config_arrays['image_urls'];
    }
    public function html() {
        if ( tools\Tools::array_has_values( $this->image_urls ) ) {
            $result = '';
            for ( $i = 0; $i < count( $this->image_urls ); $i++ ) {
                $first_slide_on = ( $i === 0 ) ? 'true' : 'false';
                $slide_number = $i + 1;
                $control_button[$i] = new controls\Control_button_template( [
                    'slide_number'   => $slide_number,
                    'first_slide_on' => $first_slide_on
                ] );
                $result .= $control_button[$i]->html();
            }
        }
        return $result;
    }
}

?>