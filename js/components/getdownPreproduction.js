/* jslint browser */
/*global window, document, getdownSlideTimer, clearInterval, setInterval */

const getdown = {
    addListeners() {
        dpTools.addAnchorButtonListeners(
            "a.getdown-slide-button",
            getdown,
            "slideButtonEvent"
        );
        dpTools.addAnchorButtonListeners(
            "a#getdown-pause-button",
            getdown,
            "pauseButtonEvent"
        );
        this.pause_on_scroll();
        this.tabIsInBackgroundListener();
    },
    getLastPauseType() {
        return this.gn( "pause button" ) ?.dataset.last_pause_type || "";
    },
    gn( query ) { // Get Node
        let tooLong = ".getdown-slide-button[aria-pressed='true']";
        let queryObject = {
            "active slide" : ".getdown-slide:not(.off)",
            "active slide button" : tooLong,
            "pause button" : "#getdown-pause-button",
            "progress bar" : "#getdown-progressbar",
            "slide container" : "#getdown-slide-container",
            "slider container" : "#getdown-container"
        };
        return document.querySelector( queryObject[ query ] );
    },
    gnl( query ) { // Get Node List
        let queryObject = {
            "all slide buttons" : ".getdown-slide-button",
            "all slides" : ".getdown-slide"
        };
        return document.querySelectorAll( queryObject[ query ] );
    },
    isSliderPlaying() {
        const pauseButton = this.gn( "pause button" );
        const status = dpTools.buttonIsOn( pauseButton );
        const test1 = dpTools.nn( pauseButton );
        const test2 = ( status ) ? false : true;
        return ( test1 && test2 ) ? true : false;
    },
    nextSlide() {
        const activeNum = this.gn( "active slide button" ) ?.dataset.slide;
        const buttonArray = this.gnl( "all slide buttons" );
        const test1 = dpTools.nn( activeNum );
        const test2 = dpTools.ns( buttonArray );
        if ( test1 && test2 ) {
            let arrayPos = Number( activeNum ) - 1;
            let args = { pos: arrayPos, buttons: buttonArray };
            let nextNum = dpTools.getNextInArray( args ) + 1;
            buttonArray.forEach( ( element ) => {
                let id = "getdown-control-" + nextNum;
                let test = ( element.id === id ) ? true : false;
                test && this.startThisSlide( element.id );
            } );
        }
    },
    pauseButtonEvent( e ) {
        e.preventDefault();
        const pauseButton = document.activeElement;
        if ( dpTools.buttonIsOn( pauseButton ) ) {
            this.toggleSliderPausePlay( "play", "null" );
        } else {
            this.toggleSliderPausePlay( "pause", "click" );
        }
    },
    pause_on_scroll() {
        window.onscroll = function ( e ) {
            const container = getdown.gn( "slider container" );
            let method1 = "pause_on_scroll";
            let method2 = "toggleSliderPausePlay";
            if ( container ) {
                if ( container.classList.contains( method1 ) ) {
                    getdown[method2]( "pause", "click" );
                }
            }
        };
    },
    slideButtonEvent( e ) {
        e.preventDefault();
        const slideButton = document.activeElement;
        this.startThisSlide( slideButton.id );
    },
    startSlideTimer() {
        const activeSlide = this.gn( "active slide" );
        if ( activeSlide ) {
            const method1 = "togglePauseAndSavePauseType";
            this[method1]( "off", this.getLastPauseType() );
            let duration = activeSlide ?.dataset.duration || "";
            duration = Number( duration );
            const startPos = getStartPos( activeSlide.id );
            const startTimestamp = getStartTime( startPos );
            editProgressBar( progressBarStart( startPos ), duration );
            getdownSlideTimer = setInterval( function() {
                const nowTimestamp = Date.now();
                const elapsedTime = nowTimestamp - startTimestamp;
                editProgressBar( elapsedTime, duration );
                if ( elapsedTime >= duration ) {
                    getdown.toggleSliderPausePlay( "pause", "null" );
                    getdown.nextSlide();
                }
            }, 20);
        }
        function getStartTime( startPos ) {
            let nowInMilliseconds = Date.now();
            return ( startPos === "play-from-start" ) ?
                nowInMilliseconds :
                nowInMilliseconds - getProgressBarElapsedTime();
        }
        function progressBarStart( startPos ) {
            const value = "play-from-start";
            const test = ( startPos === value ) ? true : false;
            const result = test ? 0 : getProgressBarElapsedTime();
            return result;
        }
        function getStartPos( currentID ) {
            const progressBar = getdown.gn( "progress bar" );
            let lastID = progressBar?.dataset.last_slide_button_id || "";
            progressBar.dataset.last_slide_button_id = currentID;
            let test = ( lastID === currentID ) ? true : false;
            return ( test ) ? "resume" : "play-from-start";
        }
        function getProgressBarElapsedTime() {
            const progressBar = getdown.gn( "progress bar" );
            return Number( progressBar?.dataset.elapsed_time || 0 );
        }
        function editProgressBar( elapsedTime, duration ) {
            const progressBar = getdown.gn( "progress bar" );
            if ( progressBar ) {
                let rateDone = elapsedTime / duration;
                let percentDone = dpTools.convertRateToPercent( rateDone );
                progressBar.style.width = percentDone + "%";
                progressBar.dataset.elapsed_time = elapsedTime;
            }
        }
    },
    startSlider() {
        this.addListeners();
        this.startSlideTimer();
    },
    startThisSlide( id ) {
        const buttonArray = this.gnl( "all slide buttons" );
        const slideArray = this.gnl( "all slides" );
        this.toggleSliderPausePlay( "pause", "null" );
        if ( dpTools.ns( buttonArray ) && dpTools.ns( slideArray ) ) {
            let i;
            for ( i = 0; i < buttonArray.length; i += 1 ) {
                let a = ( buttonArray[i].id === id ) ? "remove" : "add";
                let b = ( buttonArray[i].id === id ) ? true : false;
                dpTools.toggleCSS( slideArray[i], a, "off" );
                dpTools.toggleButton( buttonArray[i], b );
            }
            this.startSlideTimer();
        }
    },
    tabIsInBackgroundListener() {
        document.onvisibilitychange = function( e ) {
            let method = "toggleSliderPausePlay";
            getdown.isSliderPlaying() && getdown[method]( "pause", "click" );
        };
    },
    togglePauseAndSavePauseType( buttonStatus, pauseType ) {
        const pauseButton = this.gn( "pause button" );
        if ( pauseButton ) {
            dpTools.toggleButton( pauseButton, buttonStatus );
            let test1 = ( pauseType !== "null" ) ? true : false;
            let test2 = ( pauseType === "click" ) ? true : false;
            let test3 = ( pauseType.includes( "nonclick" ) ) ? "yes" : "no";
            let test4 = ( test3 === "yes" ) ? true : false;
            if ( test1 && ( test2 || test4 ) ) {
                pauseButton.dataset.last_pause_type = pauseType;
            }
        }
    },
    toggleSliderPausePlay( action, pause ) {
        const test = {};
        test.a = ( action === "play" ) ? true : false;
        test.b1 = ( action === "pause" ) ? true : false;
        test.b2 = ( pause === "click" ) ? true : false;
        test.b3 = ( pause === "null" ) ? true : false;
        test.b = ( test.b1 && ( test.b2 || test.b3 ) )
            ? true : false;
        let result = ( test.a ) ? "play slider" : "";
        ( result === "" && test.b ) && ( result = "pause slider");
        if ( result === "pause slider" ) {
            clearInterval( getdownSlideTimer );
            this.togglePauseAndSavePauseType( true, pause );
        } else if ( result === "play slider" ) {
            this.startSlideTimer();
        }
    }
};