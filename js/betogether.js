dpTools = {
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
    }
};

var betogether = {
    addListeners: function() {
        betogether.addSlideButtonListeners();
        betogether.addPauseButtonListeners();
    },
    addSlideButtonListeners: function() {
        dpTools.addAnchorButtonListeners( 'a.betogether-slide-button', betogether, 'slideButtonEvent' );
    },
    addPauseButtonListeners: function() {
        dpTools.addAnchorButtonListeners( 'a#betogether-pause-button', betogether, 'pauseButtonEvent' );
    },
    slideButtonEvent: function( e ) {
        e.preventDefault();
        const button = document.activeElement;
        betogether.runSlideButton( button );
    },
    pauseButtonEvent: function( e ) {
        e.preventDefault();
        dpTools.toggleButton( document.activeElement, 'toggle' );
        console.log( 'Pause' );
    },
    runSlideButton: function( button ) {
        const buttonArray = document.querySelectorAll( 'a.betogether-slide-button' );
        if ( dpTools.ns( buttonArray )) {
            buttonArray.forEach(element => {
                let slideArray = ( dpTools.nn( element.dataset.slide ) ) ? document.querySelectorAll('div#' + element.dataset.slide) : null;
                if (element.id === button.id) {
                    dpTools.toggleButton( element, 'on' );
                    if ( dpTools.nn( slideArray ) ) slideArray[0].classList.remove( 'off' );
                } else {
                    dpTools.toggleButton( element, 'off' );
                    if ( dpTools.nn( slideArray ) ) slideArray[0].classList.add( 'off' );
                }
            });
        }
    }
};

window.onload = function() {
    betogether.addListeners();
};