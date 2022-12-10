<?php

namespace getdown\controls;

defined( 'ABSPATH' ) or die( "Access unavailable" );

class Control_button_template {
    function __construct( $attr ) {
        $this->slide_number = $attr['slide_number'];
        $this->first_slide_on = $attr['first_slide_on'];
    }
    public function html() {
        return <<<HERE
            <a href="#" id="getdown-control-{$this->slide_number}" class="getdown-slide-button" data-slide="{$this->slide_number}" role="button" aria-pressed="{$this->first_slide_on}"></a>
HERE;
    }
}

?>