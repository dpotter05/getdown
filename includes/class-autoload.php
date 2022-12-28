<?php

namespace getdown\autoload;

class Autoload {
    public function __construct() {
        spl_autoload_register(function ( $class_name_with_namespace ) {
            if ( $class_name_with_namespace !== 'WP_Site_Health' ) {
                $pos = strrpos( $class_name_with_namespace, '\\' ) + 1;
                $file_name = strtolower( substr( $class_name_with_namespace, $pos ) );
                $file_name = 'class-' . str_replace( '_', "-", $file_name ) . '.php';
                include_once $file_name;
            }
        });
    }
}

?>