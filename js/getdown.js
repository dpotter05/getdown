/* jslint browser */
/*global window, document, getdownSlideTimer, clearInterval, setInterval */

const getdown = {
    addListeners() {
        dpTools.addAnchorButtonListeners(
            "a.getdown-slide-button",
            getdown, "slideButtonEvent"
        );
        dpTools.addAnchorButtonListeners(
            "a#getdown-pause-button",
            getdown, "pauseButtonEvent"
        );
        getdown.pause_on_scroll();
        getdown.tabIsInBackgroundListener();
    },
    getLastPauseType() {
        return getdown.gn( "pause button" )?.dataset.last_pause_type || "";
    },
    gn( query ) { // Get Node
        let queryObject = {
            "active slide" : ".getdown-slide:not(.off)",
            "active slide button" :
                ".getdown-slide-button[aria-pressed='true']",
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
        const pauseButton = getdown.gn( "pause button" );
        return (
            pauseButton &&
            dpTools.getButtonStatus( pauseButton ) === "off"
        ) ? "yes" : "no";
    },
    nextSlide() {
        const activeSlideButton = getdown.gn( "active slide button" );
        const slideButtonArray = getdown.gnl( "all slide buttons" );
        if (
            activeSlideButton &&
            dpTools.ns( slideButtonArray )
        ) {
            let currentSlideNumber = activeSlideButton?.dataset.slide || "";
            let arrayPosition = currentSlideNumber - 1;
            let nextSlideNumber = dpTools.getNextInArray(
                    arrayPosition,
                    slideButtonArray
                ) + 1;
            slideButtonArray.forEach( ( element ) => {
                if ( element.id == "getdown-control-" + nextSlideNumber ) {
                    getdown.startThisSlide( element );
                }
            });
        }
    },
    pauseButtonEvent( e ) {
        e.preventDefault();
        const pauseButton = document.activeElement;
        if ( dpTools.getAnchorButtonStatus( pauseButton ) === "off" ) {
            getdown.toggleSliderPausePlay( "pause", "click" );
        } else {
            getdown.toggleSliderPausePlay( "play", "null" );
        }
    },
    pause_on_scroll() {
        window.onscroll = function ( e ) {
            const sliderMainContainer = getdown.gn( "slider container" );
            if ( sliderMainContainer ) {
                if ( sliderMainContainer.classList.contains(
                        "pause_on_scroll"
                    )
                ) {
                    getdown.toggleSliderPausePlay( "pause", "click" );
                }
            }
        };
    },
    slideButtonEvent( e ) {
        e.preventDefault();
        const slideButton = document.activeElement;
        getdown.startThisSlide( slideButton );
    },
    sliderIsInViewport() {
        const slideContainer = getdown.gn( "slide container" );
        let result = "yes";
        if ( slideContainer ) {
            let pauseHeight = 0.5 *
                ( dpTools.getElementHeight( slideContainer ) );
            let elementIsInViewport = dpTools.elementIsInViewport(
                slideContainer,
                pauseHeight.toFixed(2)
            );
            result = ( elementIsInViewport === "yes" ) ? "yes" : "no";
        }
        return result;
    },
    startSlideTimer() {
        const activeSlide = getdown.gn( "active slide" );
        if ( activeSlide ) {
            getdown.togglePauseButtonAndRecordPauseType(
                "off",
                getdown.getLastPauseType()
            );
            const totalDuration = Number( activeSlide?.dataset.duration || "" );
            const startPosition = resumeOrPlayFromStart( activeSlide.id );
            const startTimestamp = getStartTime( startPosition );
            updateProgressBarLength(
                getProgressBarStartTime( startPosition ),
                totalDuration
            );
            getdownSlideTimer = setInterval( function() {
                const nowTimestamp = Date.now();
                const elapsedTime = nowTimestamp - startTimestamp;
                updateProgressBarLength( elapsedTime, totalDuration );
                if ( elapsedTime >= totalDuration ) {
                    getdown.toggleSliderPausePlay( "pause", "null" );
                    getdown.nextSlide();
                }
            }, 20);
        }
        function getStartTime( startPosition ) {
            let nowInMilliseconds = Date.now();
            return ( startPosition === "play-from-start" ) ?
                nowInMilliseconds :
                nowInMilliseconds - getProgressBarElapsedTime();
        }
        function getProgressBarStartTime( startPosition ) {
            return ( startPosition === "play-from-start" ) ?
                0 :
                getProgressBarElapsedTime();
        }
        function resumeOrPlayFromStart( currentID ) {
            const progressBar = getdown.gn( "progress bar" );
            let lastID = progressBar?.dataset.last_slide_button_id || "";
            progressBar.dataset.last_slide_button_id = currentID;
            return ( lastID === currentID ) ? "resume" : "play-from-start";
        }
        function getProgressBarElapsedTime() {
            const progressBar = getdown.gn( "progress bar" );
            return Number( progressBar?.dataset.elapsed_time || 0 );
        }
        function updateProgressBarLength( elapsedTime, totalDuration ) {
            const progressBar = getdown.gn( "progress bar" );
            if ( progressBar ) {
                let rateDone = elapsedTime / totalDuration;
                let percentDone = dpTools.convertRateToPercent( rateDone );
                progressBar.style.width = percentDone + "%";
                progressBar.dataset.elapsed_time = elapsedTime;
            }
        }
    },
    startSlider() {
        getdown.addListeners();
        getdown.startSlideTimer();
    },
    startThisSlide( slideButton ) {
        const slideButtonArray = getdown.gnl( "all slide buttons" );
        const slideArray = getdown.gnl( "all slides" );
        getdown.toggleSliderPausePlay( "pause", "null" );
        if ( dpTools.ns( slideButtonArray ) && dpTools.ns( slideArray ) ) {
            let i;
            for ( i = 0; i < slideButtonArray.length; i += 1 ) {
                if ( slideButtonArray[i].id === slideButton.id ) {
                    dpTools.toggleButton( slideButtonArray[i], "on" );
                    dpTools.toggleCSS( slideArray[i], "remove", "off" );
                } else {
                    dpTools.toggleButton( slideButtonArray[i], "off" );
                    dpTools.toggleCSS( slideArray[i], "add", "off" );
                }
            }
            getdown.startSlideTimer();
        }
    },
    tabIsInBackgroundListener() {
        document.onvisibilitychange = function( e ) {
            if ( getdown.isSliderPlaying() === "yes" ) {
                getdown.toggleSliderPausePlay( "pause", "click" );
            }
        };
    },
    togglePauseButtonAndRecordPauseType( action, pauseType ) {
        const pauseButton = getdown.gn( "pause button" );
        if ( pauseButton ) {
            dpTools.toggleButton( pauseButton, action );
            let pauseTypeNotNull = ( pauseType !== "null" ) ? true : false;
            let pauseTypeClick = ( pauseType === "click" ) ? true : false;
            let stringContains = dpTools.stringContains(
                pauseType,
                "nonclick"
            );
            let pauseTypeNonclick = ( stringContains === "yes" ) ? true : false;
            if ( pauseTypeNotNull && ( pauseTypeClick || pauseTypeNonclick ) ) {
                pauseButton.dataset.last_pause_type = pauseType;
            }
        }
    },
    toggleSliderPausePlay( action, pauseType ) {
        let result = "";
        if ( action === "play" ) {
            result = "play slider";
        } else if ( action === "pause" ) {
            if (
                pauseType === "click" ||
                pauseType === "null" ||
                beginNonclickPause( pauseType ) === "yes"
            ) {
                result = "pause slider";
            }
        }
        if ( result === "pause slider" ) {
            clearInterval( getdownSlideTimer );
            getdown.togglePauseButtonAndRecordPauseType( "on", pauseType );
        } else if ( result === "play slider" ) {
            getdown.startSlideTimer();
        }
        function beginNonclickPause( pauseType ) {
            return (
                dpTools.stringContains( pauseType, "nonclick" ) === "yes" &&
                getdown.isSliderPlaying() === "yes"
            ) ?
            "yes" :
            "no" ;
        }
    }
};

const dpTools = {
    addAnchorButtonListeners( arrayString, object, eventName ) {
        const buttonArray = document.querySelectorAll( arrayString );
        if ( dpTools.ns( buttonArray ) ) {
            buttonArray.forEach( ( element ) => {
                element.addEventListener("click", function( e ) {
                    object[ eventName ]( e );
                });
                element.onkeydown = function( e ) {
                    keystroke = dpTools.getKeystrokeNames( e );
                    if ( keystroke == "enter" || keystroke == "spacebar" ) {
                        e.preventDefault();
                        object[ eventName ]( e );
                    }
                };
            });
        }
    },
    convertRateToPercent( number ) {
        let percent = number * 100;
        return percent.toFixed(2);
    },
    elementIsInViewport( el, pixelsShowing ) {
        let rect = el.getBoundingClientRect();
        let testTop = ( window.innerHeight - rect.top > pixelsShowing ) ?
            true :
            false;
        let testBottom = ( rect.bottom > pixelsShowing ) ? true : false;
        return ( testTop && testBottom ) ? "yes" : "no";
    },
    getAnchorButtonStatus( button ) {
        const status = button.getAttribute( "aria-pressed" );
        return ( status === "true" ) ? "on" : "off";
    },
    getButtonStatus( button ) {
        return ( button.getAttribute( "aria-pressed" ) === "true" ) ?
        "on" :
        "off";
    },
    getElementHeight( element ) {
        let rect = element.getBoundingClientRect();
        return ( rect.top > rect.bottom ) ?
            rect.top - rect.bottom :
            rect.bottom - rect.top;
    },
    getKeystrokeNames( e ) {
        let k = ( e.key === "ArrowUp" ) ? "up" : "not found";
        k = ( e.key === "ArrowDown" ) ? "down" : k;
        k = ( e.key === "ArrowLeft" ) ? "left" : k;
        k = ( e.key === "ArrowRight" ) ? "right" : k;
        k = (
            e.key === " " ||
            e.key === "Spacebar" ||
            e.code === "Space"
        ) ?
            "spacebar" :
            k;
        k = ( e.key === "Enter" ) ? "enter" : k;
        k = ( e.key === "Home" ) ? "home" : k;
        k = ( e.key === "End" ) ? "end" : k;
        k = ( e.key === "Escape" ) ? "escape" : k;
        return k;
    },
    getNextInArray( currentPosition, array ) {
        currentPosition = Number( currentPosition );
        return ( currentPosition + 1 < array.length ) ? currentPosition + 1 : 0;
    },
    nn( element ) { // Not Null
        return ( element !== null ) ? true : false;
    },
    ns( array ) { // Nodelist Set
        return ( array && array.length > 0 ) ? true : false;
    },
    stringContains( haystack, needle ) {
        return ( haystack.indexOf( needle ) !== -1 ) ? "yes" : "no";
    },
    toggleButton( button, action ) {
        if ( action === "on" || action === "off") {
            action = ( action === "on" ) ? true : false;
        } else if ( action === "toggle" ) {
            action = (
                button.getAttribute( "aria-pressed" ) === "true"
            ) ?
            false :
            true;
        }
        button.setAttribute( "aria-pressed", action );
    },
    toggleCSS( element, action, css ) {
        if ( action === "add" ) {
            element.classList.add( css );
        } else if ( action === "remove" ) {
            element.classList.remove( css );
        } else if (action === "toggle" ) {
          element.classList.toggle( css );
        }
    }
};

window.onload = function() {
    getdown.startSlider();
};