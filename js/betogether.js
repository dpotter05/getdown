/* jslint browser */
/*global window, document, betogetherSlideTimer, clearInterval, setInterval */

const betogether = {
    addListeners() {
        dpTools.addAnchorButtonListeners(
            "a.betogether-slide-button",
            betogether, "slideButtonEvent"
        );
        dpTools.addAnchorButtonListeners(
            "a#betogether-pause-button",
            betogether, "pauseButtonEvent"
        );
        betogether.pause_on_scroll();
        betogether.tabIsInBackgroundListener();
    },
    getLastPauseType() {
        return betogether.gn( "pause button" )?.dataset.last_pause_type || "";
    },
    gn( query ) { // Get Node
        let queryObject = {
            "active slide" : ".betogether-slide:not(.off)",
            "active slide button" :
                ".betogether-slide-button[aria-pressed='true']",
            "pause button" : "#betogether-pause-button",
            "progress bar" : "#betogether-progress-bar",
            "slide container" : "#betogether-slide-container",
            "slider container" : "#betogether-container"
        };
        return document.querySelector( queryObject[ query ] );
    },
    gnl( query ) { // Get Node List
        let queryObject = {
            "all slide buttons" : ".betogether-slide-button",
            "all slides" : ".betogether-slide"
        };
        return document.querySelectorAll( queryObject[ query ] );
    },
    isSliderPlaying() {
        const pauseButton = betogether.gn( "pause button" );
        return (
            pauseButton &&
            dpTools.getButtonStatus( pauseButton ) === "off"
        ) ? "yes" : "no";
    },
    nextSlide() {
        const activeSlideButton = betogether.gn( "active slide button" );
        const slideButtonArray = betogether.gnl( "all slide buttons" );
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
                if ( element.id == "betogether-control-" + nextSlideNumber ) {
                    betogether.startThisSlide( element );
                }
            });
        }
    },
    pauseButtonEvent( e ) {
        e.preventDefault();
        const pauseButton = document.activeElement;
        if ( dpTools.getAnchorButtonStatus( pauseButton ) === "off" ) {
            betogether.toggleSliderPausePlay( "pause", "click" );
        } else {
            betogether.toggleSliderPausePlay( "play", "null" );
        }
    },
    pause_on_scroll() {
        window.onscroll = function ( e ) {
            const sliderMainContainer = betogether.gn( "slider container" );
            if ( sliderMainContainer ) {
                if ( sliderMainContainer.classList.contains(
                        "pause_on_scroll"
                    )
                ) {
                    betogether.toggleSliderPausePlay( "pause", "click" );
                }
            }
        };
    },
    slideButtonEvent( e ) {
        e.preventDefault();
        const slideButton = document.activeElement;
        betogether.startThisSlide( slideButton );
    },
    sliderIsInViewport() {
        const slideContainer = betogether.gn( "slide container" );
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
        const activeSlide = betogether.gn( "active slide" );
        if ( activeSlide ) {
            betogether.togglePauseButtonAndRecordPauseType(
                "off",
                betogether.getLastPauseType()
            );
            const totalDuration = Number( activeSlide?.dataset.duration || "" );
            const startPosition = resumeOrPlayFromStart( activeSlide.id );
            const startTimestamp = getStartTime( startPosition );
            updateProgressBarLength(
                getProgressBarStartTime( startPosition ),
                totalDuration
            );
            betogetherSlideTimer = setInterval( function() {
                const nowTimestamp = Date.now();
                const elapsedTime = nowTimestamp - startTimestamp;
                updateProgressBarLength( elapsedTime, totalDuration );
                if ( elapsedTime >= totalDuration ) {
                    betogether.toggleSliderPausePlay( "pause", "null" );
                    betogether.nextSlide();
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
            const progressBar = betogether.gn( "progress bar" );
            let lastID = progressBar?.dataset.last_slide_button_id || "";
            progressBar.dataset.last_slide_button_id = currentID;
            return ( lastID === currentID ) ? "resume" : "play-from-start";
        }
        function getProgressBarElapsedTime() {
            const progressBar = betogether.gn( "progress bar" );
            return Number( progressBar?.dataset.elapsed_time || 0 );
        }
        function updateProgressBarLength( elapsedTime, totalDuration ) {
            const progressBar = betogether.gn( "progress bar" );
            if ( progressBar ) {
                let rateDone = elapsedTime / totalDuration;
                let percentDone = dpTools.convertRateToPercent( rateDone );
                progressBar.style.width = percentDone + "%";
                progressBar.dataset.elapsed_time = elapsedTime;
            }
        }
    },
    startSlider() {
        betogether.addListeners();
        betogether.startSlideTimer();
    },
    startThisSlide( slideButton ) {
        const slideButtonArray = betogether.gnl( "all slide buttons" );
        const slideArray = betogether.gnl( "all slides" );
        betogether.toggleSliderPausePlay( "pause", "null" );
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
            betogether.startSlideTimer();
        }
    },
    tabIsInBackgroundListener() {
        document.onvisibilitychange = function( e ) {
            if ( betogether.isSliderPlaying() === "yes" ) {
                betogether.toggleSliderPausePlay( "pause", "click" );
            }
        };
    },
    togglePauseButtonAndRecordPauseType( action, pauseType ) {
        const pauseButton = betogether.gn( "pause button" );
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
            clearInterval( betogetherSlideTimer );
            betogether.togglePauseButtonAndRecordPauseType( "on", pauseType );
        } else if ( result === "play slider" ) {
            betogether.startSlideTimer();
        }
        function beginNonclickPause( pauseType ) {
            return (
                dpTools.stringContains( pauseType, "nonclick" ) === "yes" &&
                betogether.isSliderPlaying() === "yes"
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
    betogether.startSlider();
};