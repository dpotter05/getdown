/* global betogetherSlideTimer:true */

const betogether = {
    startSliderOnLoad() {
        betogether.addListeners();
        betogether.startSlideTimer();
    },
    addListeners() {
        dpTools.addAnchorButtonListeners( 'a.betogether-slide-button', betogether, 'slideButtonEvent' );
        dpTools.addAnchorButtonListeners( 'a#betogether-pause-button', betogether, 'pauseButtonEvent' );
        const sliderMainContainerArray = betogether.getElementsArray( 'slider container' );
        const slideContainerArray = betogether.getElementsArray( 'slide container' );
        if ( dpTools.ns( sliderMainContainerArray ) && dpTools.ns( slideContainerArray ) ) {
            let sliderMainContainer = sliderMainContainerArray[0];
            let slideContainer = slideContainerArray[0];
            if (sliderMainContainer.classList.contains( 'pause-on-mouseover' )) {
                slideContainer.onmouseenter = function(e) {
                    betogether.toggleSliderPausePlay( 'pause', 'nonclick' );
                };
                slideContainer.onmouseout = function(e) {
                    betogether.toggleSliderPausePlay( 'play', 'nonclick' );
                };
            }
        }
    },
    slideButtonEvent( e ) {
        e.preventDefault();
        const button = document.activeElement;
        betogether.startThisSlide( button );
    },
    pauseButtonEvent( e ) {
        e.preventDefault();
        const pauseButton = document.activeElement;
        if ( dpTools.getAnchorButtonStatus( pauseButton ) === 'off' ) {
            betogether.toggleSliderPausePlay( 'pause', 'click' );
        } else {
            betogether.toggleSliderPausePlay( 'play', null );
        }
    },
    togglePauseButton( action, pauseType ) {
        const pauseButtonArray = betogether.getElementsArray( 'pause button' );
        if ( dpTools.ns( pauseButtonArray ) ) {
            let pauseButton = pauseButtonArray[0];
            dpTools.toggleButton( pauseButton, action );
            if ( pauseType === 'click' || pauseType === 'nonclick' ) {
                pauseButton.dataset.last_pause_type = pauseType;
            }       
        }
    },
    getLastPauseType() {
        const pauseButtonArray = betogether.getElementsArray( 'pause button' );
        if ( dpTools.ns( pauseButtonArray ) ) {
            let pauseButton = pauseButtonArray[0];
            return ( dpTools.nn( pauseButton.dataset.last_pause_type ) ) ? pauseButton.dataset.last_pause_type : 'nonclick';
        }
    },
    toggleSliderPausePlay( action, type ) {
        let result = '';
        if ( ( type === 'click' || type === null ) && ( action === 'play' || action === 'pause' ) ) {
            result = ( action === 'play' ) ? 'play slider' : 'pause slider';
        } else if ( type === 'nonclick' ) {
            if ( action === 'pause' && betogether.isSliderPlaying() === 'yes' ) {
                result = 'pause slider';
            } else if ( action === 'play' && betogether.getLastPauseType() === 'nonclick') {
                result = 'play slider';
            }
        }
        if ( result === 'pause slider' ) {
            betogether.stopSlider( type );
        } else if ( result === 'play slider' ) {
            betogether.startSlideTimer();
        }
    },
    isSliderPlaying() {
        const pauseButtonArray = betogether.getElementsArray( 'pause button' );
        let result = 'no';
        if ( dpTools.ns( pauseButtonArray ) ) {
            let pauseButton = pauseButtonArray[0];
            result = ( dpTools.getButtonStatus( pauseButton ) === 'off' ) ? 'yes' : result;
        }
        return result;
    },
    stopSlider( type ) {
        clearInterval( betogetherSlideTimer );
        betogether.togglePauseButton( 'on', type );
    },
    startSlideTimer() {
        const activeSlideArray = betogether.getElementsArray( 'active slide' );
        if ( dpTools.ns( activeSlideArray ) ) {
            betogether.togglePauseButton( 'off', betogether.getLastPauseType() );
            let currentSlide = activeSlideArray[0];
            const totalDuration = Number( currentSlide.dataset.duration );
            let startPosition = betogether.resumeOrPlayFromStart( currentSlide.id );
            let startTimestamp = betogether.getStartTime( startPosition );
            betogether.updateProgressBarLength( betogether.getProgressBarStartTime( startPosition ), totalDuration);
            betogetherSlideTimer = setInterval( function() {
                let timestamp = Date.now();
                let elapsedTime = timestamp - startTimestamp;
                betogether.updateProgressBarLength( elapsedTime, totalDuration );
                if ( elapsedTime >= totalDuration ) {
                    betogether.toggleSliderPausePlay( 'pause', null );
                    betogether.nextSlide();
                }
            }, 20);
        }
    },
    getStartTime( startPosition ) {
        let startTimestamp = Date.now();
        return ( startPosition === 'play-from-start' ) ? startTimestamp : startTimestamp - betogether.getProgressBarElapsedTime();
    },
    getProgressBarStartTime( startPosition ) {
        return ( startPosition === 'play-from-start' ) ? 0 : betogether.getProgressBarElapsedTime();
    },
    resumeOrPlayFromStart( currentSlideButtonID ) {
        const progressBarArray = betogether.getElementsArray( 'progress bar' );
        let result = 'play-from-start';
        if ( dpTools.ns( progressBarArray ) ) {
            let progressbar = progressBarArray[0];
            if ( dpTools.nn( progressbar.dataset.last_slide_button_id ) ) {
                result = ( progressbar.dataset.last_slide_button_id === currentSlideButtonID ) ? 'resume' : result;
            }
            progressbar.dataset.last_slide_button_id = currentSlideButtonID;
        }    
        return result;
    },
    getProgressBarElapsedTime() {
        const progressBarArray = betogether.getElementsArray( 'progress bar' );
        if ( dpTools.ns( progressBarArray ) ) {
            let progressbar = progressBarArray[0];
            return ( dpTools.nn( progressbar.dataset.elapsed_time ) ) ? Number( progressbar.dataset.elapsed_time ) : 0;
        }
    },
    updateProgressBarLength( elapsedTime, totalDuration ) {
        const progressBarArray = betogether.getElementsArray( 'progress bar' );
        if ( dpTools.ns( progressBarArray ) ) {
            let progressbar = progressBarArray[0];
            progressbar.style.width = ( ( elapsedTime / totalDuration ) * 100 ).toFixed(2) + '%';
            progressbar.dataset.elapsed_time = elapsedTime;
        }
    },
    nextSlide() {
        const slideButtonArray = betogether.getElementsArray( 'all slide buttons' );
        const activeSlideButtonArray = betogether.getElementsArray( 'active slide button' );
        const slideArray = betogether.getElementsArray( 'all slides' );
        if ( dpTools.ns( activeSlideButtonArray ) && dpTools.ns( slideButtonArray ) ) {
            let currentSlideButton = activeSlideButtonArray[0];
            let currentSlideNumber = ( dpTools.nn( currentSlideButton.dataset.slide ) ) ? Number( currentSlideButton.dataset.slide ) : 1;
            let nextSlideNumber = dpTools.getNextInArray( currentSlideNumber, slideButtonArray );
            slideButtonArray.forEach(element => {
                if ( element.id == 'betogether-control-' + nextSlideNumber ) {
                    betogether.startThisSlide( element );
                }
            });
        }
    },
    startThisSlide( slideButton ) {
        const slideButtonArray = betogether.getElementsArray( 'all slide buttons' );
        const slideArray = betogether.getElementsArray( 'all slides' );
        betogether.toggleSliderPausePlay( 'pause', null )
        for (let i = 0; i < slideButtonArray.length; i++) {
            if ( slideButtonArray[i].id === slideButton.id ) {
                dpTools.toggleButton( slideButtonArray[i], 'on' );
                dpTools.toggleCSS( slideArray[i], 'remove', 'off' );
            } else {
                dpTools.toggleButton( slideButtonArray[i], 'off' );
                dpTools.toggleCSS( slideArray[i], 'add', 'off' );
            }
        }
        betogether.startSlideTimer();
    },
    getElementsArray( query ) {
        let array = [];
        let queryObject = {
            'active slide button' : 'a.betogether-slide-button[aria-pressed="true"]',
            'all slide buttons' : 'a.betogether-slide-button',
            'all slides' : 'div.betogether-slide',
            'active slide' : 'div.betogether-slide:not(.off)',
            'progress bar' : 'div#betogether-progress-bar',
            'pause button' : 'a#betogether-pause-button',
            'slider container' : 'div#betogether-container',
            'slide container' : 'div#betogether-slide-container'
        }
        return document.querySelectorAll( queryObject[ query ] );
    }
};

const dpTools = {
    ns( array ) { /* Nodelist Set */
        return ( array !== null && array.length > 0 ) ? true : false;
    },
    nn( element ) { /* Not Null */
        return ( element !== null ) ? true : false;
    },
    toggleButton( button, action ) {
        if ( action === 'on' || action === 'off') {
            action = ( action === 'on' ) ? true : false;
        } else if ( action === 'toggle' ) {
            action = ( button.getAttribute( 'aria-pressed' ) == 'true' ) ? false : true;
        }
        button.setAttribute( 'aria-pressed', action );
    },
    getButtonStatus( button ) {
        return ( button.getAttribute( 'aria-pressed' ) === 'true' ) ? 'on' : 'off';
    },
    getKeystrokeNames( e ) {
        let k = ( e.key === 'ArrowUp' ) ? 'up' : 'not found';
        k = ( e.key === 'ArrowDown' ) ? 'down' : k;
        k = ( e.key === 'ArrowLeft' ) ? 'left' : k;
        k = ( e.key === 'ArrowRight' ) ? 'right' : k;
        k = ( e.key === ' ' || e.key === 'Spacebar' || e.code === 'Space' ) ? 'spacebar' : k;
        k = ( e.key === 'Enter' ) ? 'enter' : k;
        k = ( e.key === 'Home' ) ? 'home' : k;
        k = ( e.key === 'End' ) ? 'end' : k;
        k = ( e.key === 'Escape' ) ? 'escape' : k;
        return k;
    },
    addAnchorButtonListeners( arrayString, object, eventName ) {
        const buttonArray = document.querySelectorAll( arrayString );
        if ( dpTools.ns( buttonArray ) ) {
            buttonArray.forEach(element => {
                element.addEventListener("click", function(e) {
                    object[ eventName ]( e );
                });
                element.onkeydown = function( e ) {
                    keystroke = dpTools.getKeystrokeNames( e );
                    if ( ( keystroke == 'enter' || keystroke == 'spacebar' ) ) {
                        e.preventDefault();
                        object[ eventName ]( e );
                    }
                }
            });
        }
    },
    toggleCSS( element, action, css ) {
        if ( action === 'add' || action === 'remove' ) {
          ( ( action === 'add') ? element.classList.add( css ) : element.classList.remove( css ) );
        } else if (action == 'toggle' ) {
          element.classList.toggle( css );
        }
    },
    getNextInArray( currentPosition, array ) {
        currentPosition = Number(currentPosition);
        return ( currentPosition + 1 <= array.length ) ? currentPosition + 1 : 1;
    },
    getAnchorButtonStatus( button ) {
        const status = button.getAttribute( 'aria-pressed' );
        return ( status === 'true' ) ? "on" : "off";
    }
};

window.onload = function() {
    betogether.startSliderOnLoad();
};