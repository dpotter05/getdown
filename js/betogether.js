/* global betogetherSlideTimer:true */

const dpTools = {
    ns( array ) {
        return ( array !== null && array.length > 0 ) ? true : false;
    },
    nn( element ) {
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
                    betogether.event( e );
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

const betogether = {
    getElements( query ) {
        let array = [];
        if ( query === 'active slide button' ) {
            array = document.querySelectorAll( 'a.betogether-slide-button[aria-pressed="true"]' );
        } else if ( query === 'all slide buttons' ) {
            array = document.querySelectorAll( 'a.betogether-slide-button' );
        } else if ( query === 'all slides' ) {
            array = document.querySelectorAll( 'div.betogether-slide' );
        } else if ( query === 'active slide' ) {
            array = document.querySelectorAll( 'div.betogether-slide:not( .off )' );
        } else if ( query === 'progress bar' ) {
            array = document.querySelectorAll( 'div#betogether-progress-bar' );
        }
        return array;
    },
    startSliderOnLoad() {
        betogether.addListeners();
        betogether.startSlideTimer();
    },
    addListeners() {
        dpTools.addAnchorButtonListeners( 'a.betogether-slide-button', betogether, 'slideButtonEvent' );
        dpTools.addAnchorButtonListeners( 'a#betogether-pause-button', betogether, 'pauseButtonEvent' );
    },
    slideButtonEvent( e ) {
        e.preventDefault();
        const button = document.activeElement;
        betogether.startThisSlide( button );
    },
    pauseButtonEvent( e ) {
        e.preventDefault();
        const pauseButton = document.activeElement;
        dpTools.toggleButton( pauseButton, 'toggle' );
        if ( dpTools.getAnchorButtonStatus( pauseButton ) === 'on' ) {
            betogether.toggleSlider( 'pause', 'click' );
        } else {
            betogether.toggleSlider( 'play', 'click' );
        }
    },
    toggleSlider( action, type ) {
        if ( action === 'pause' && type === 'click' ) {
            clearInterval(betogetherSlideTimer);
        } else if ( action === 'play' ) {
            betogether.startSlideTimer();
        }        
    }, startSlideTimer() {
        const activeSlideArray = betogether.getElements( 'active slide' );
        if ( dpTools.ns( activeSlideArray ) ) {
            const totalDuration = Number( activeSlideArray[0].dataset.duration );
            const nowStamp = Date.now();
            const start = nowStamp;
            betogether.updateProgressBarLength( 0, totalDuration );
            betogetherSlideTimer = setInterval( function() {
                let timestamp = Date.now();
                let elapsedTime = timestamp - start;
                betogether.updateProgressBarLength( elapsedTime, totalDuration );
                if (elapsedTime >= totalDuration) {
                    clearInterval(betogetherSlideTimer);
                    betogether.nextSlide();
                }
            }, 20);
        }
    }, updateProgressBarLength( elapsedTime, totalDuration ) {
        const progressBarArray = betogether.getElements( 'progress bar' );
        if ( dpTools.ns( progressBarArray ) ) {
            let progressbar = progressBarArray[0];
            progressbar.style.width = ( ( elapsedTime / totalDuration ) * 100 ).toFixed(2) + '%';
        }
    }, nextSlide() {
        const slideButtonArray = betogether.getElements( 'all slide buttons' );
        const activeSlideButtonArray = betogether.getElements( 'active slide button' );
        const slideArray = betogether.getElements( 'all slides' );
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
    }, startThisSlide( slideButton ) {
        const slideButtonArray = betogether.getElements( 'all slide buttons' );
        const slideArray = betogether.getElements( 'all slides' );
        betogether.toggleSlider( 'pause', 'click' )
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
    }
};

window.onload = function() {
    betogether.startSliderOnLoad();
};