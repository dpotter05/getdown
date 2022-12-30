<?php

namespace getdown\autoload;

class Autoload {
    public function __construct() {
        spl_autoload_register(function ( $class_name_with_namespace ) {
            $namespace_slug = 'getdown\\';
            if ( str_contains( $class_name_with_namespace, $namespace_slug ) ) {
                $pos = strrpos( $class_name_with_namespace, '\\' ) + 1;
                $file_name = strtolower( substr( $class_name_with_namespace, $pos ) );
                $file_name = 'class-' . str_replace( '_', "-", $file_name ) . '.php';
                include_once $file_name;
            }
        });
    }
}

?>