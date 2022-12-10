<?php

namespace getdown\tools;

defined( 'ABSPATH' ) or die( "Access unavailable" );

class Tools {
    public static $lineBreak = '
';
    public static $tab = <<<HERE
    
HERE;
    public static function emptyCheck( $value, $valueIfEmpty ) {
        return ( !empty( $value ) ) ? $value : $valueIfEmpty;
    }
    public static function emptyCheckArrayWithDefaults( $args, $valueIfEmptyArray ) {
        $result = [];
        foreach ( $valueIfEmptyArray as $key => $valueIfEmpty ) {
            $result[ $key ] = ( array_key_exists( $key, $args ) )
                ? self::emptyCheck( $args[ $key ], $valueIfEmpty )
                : $result[ $key ] = $valueIfEmpty;
        }
        return $result;
    }
    public static function emptyCheckAndSanitize( $string, $valueIfEmpty ) {
        return ( !empty( $string ) ) ? trim( sanitize_text_field( $string ) ) : $valueIfEmpty;
    }
    public static function wrapInHTMLTag( $string, $tag ) {
        return ( !empty( $string ) ) ? '<' . $tag . '>' . $string . '</' . $tag . '>' : '';
    }
    public static function indent( $tabNumber ) {
        $result = '';
        if ( !empty( $tabNumber ) && is_numeric( $tabNumber )) {
            for ( $i = 0; $i < $tabNumber; $i++ ) {
                $result .= self::$tab;
            }
        }
        return $result;
    }
    public static function array_has_values( $array ) {
        return ( is_array( $array ) && count( $array ) > 0 ) ? true : false;
    }
    public static function clean_url( $url ) {
        return trim( sanitize_url( $url ) );
    }
    public static function get_array_from_csv_string( $string ) {
        $result = '';
        $string = sanitize_text_field( self::emptyCheck( $string, '' ) );
        if ( is_string( $string ) ) {
            if ( strpos( $string, ',' ) !== false ) {
                $result = explode( ',', $string );
            } else {
                $result = array( $string );
            }
        }
        return $result;
    }
    public static function convert_input_strings_to_arrays( $atts ) {
        $args = [];
        if ( !empty( $atts ) && is_array( $atts ) ) {
            foreach ( $atts as $key => $value ) {
                $args[$key] = self::get_array_from_csv_string( $atts[$key] );
            }
        }
        return $args;
    }
}

?>