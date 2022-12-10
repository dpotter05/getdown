<?php

namespace getdown\slider;

defined( 'ABSPATH' ) or die( "Access unavailable" );

class Slider_template {
    function __construct( $data ) {
        $this->css_class = $data['cssClass'];
        $this->slide = $data['slide'];
        $this->controls = $data['controls'];
        $this->style = $data['style'];
        $this->polaroid_src = plugins_url() . '/getdown/img/polaroid.png';
        $this->play_src = plugins_url() . '/getdown/svg/play.svg';
    }
    public function html() {
        return <<<HERE
    <aside id="getdown-container" class="{$this->css_class}" style="{$this->style}">
        <div id="getdown-slide-container">
{$this->slide}
            <div id="getdown-polaroid-container">
                <img src="{$this->polaroid_src}" alt="Polaroid picture frame" />
            </div>
        </div>
        <div id="getdown-progressbar-container">
            <div id="getdown-progressbar"></div>
        </div>
        <div id="getdown-controls-container">
{$this->controls}
            <a href="#" id="getdown-pause-button" role="button" aria-pressed="false" data-last_pause_type="nonclick onload">
                <img src="{$this->play_src}">
            </a>
        </div>
    </aside>
HERE;
    }
}
?>