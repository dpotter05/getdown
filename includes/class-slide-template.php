<?php

namespace getdown\slide;

defined( 'ABSPATH' ) or die( "Access unavailable" );

class Slide_template {
    function __construct( $args ) {
        $this->showIfFirstSlide = ( $args['count'] === 0 ) ? '' : ' off';
        $this->count = ( is_numeric( $args['count'] ) ) ? $args['count'] + 1 : '';
        $this->alt = \getdown\tools\Tools::emptyCheckAndSanitize( $args['alt'], '' );
        $this->duration = \getdown\tools\Tools::emptyCheckAndSanitize( $args['duration'], '4000' );
        $this->message = \getdown\tools\Tools::emptyCheckAndSanitize( $args['message'], '' );
        $this->message = ( $this->message === '-' || empty( $this->message ) ) ? '' : \getdown\tools\Tools::wrapInHTMLTag( $this->message, 'p' );
        $this->image_url = ( !empty( $args['image_url'] ) ) ? $args['image_url'] : false;
    }
    public function html() {
        $result = '';
        if ( $this->image_url ) {
            $result = <<<HERE
            <div id="getdown-slide-{$this->count}" class="getdown-slide{$this->showIfFirstSlide}" data-duration="{$this->duration}">
                <img src="{$this->image_url}" alt="{$this->alt}" />
                {$this->message}
            </div>
HERE;
        }
        return $result . \getdown\tools\Tools::$lineBreak;
    }
}

?>