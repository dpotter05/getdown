dpTools = {
    ns( array ) {
        return ( array !== null && array.length > 0 ) ? true : false;
    },
    nn( element ) {
        return ( element !== null ) ? true : false;
    },
    toggleButton( button, action ) {
        if ( action === "on" || action === "off") {
            action = ( action === "on" ) ? true : false;
        } else if ( action === "toggle" ) {
            action = ( button.getAttribute( "aria-pressed" ) == "true" ) ? false : true;
        }
        button.setAttribute( "aria-pressed", action );
    },
    getKeystrokeNames( e ) {
        let k = ( e.key === "ArrowUp" ) ? "up" : "not found";
        k = ( e.key === "ArrowDown" ) ? "down" : k;
        k = ( e.key === "ArrowLeft" ) ? "left" : k;
        k = ( e.key === "ArrowRight" ) ? "right" : k;
        k = ( e.key === " " || e.key === "Spacebar" || e.code === "Space" ) ? "spacebar" : k;
        k = ( e.key === "Enter" ) ? "enter" : k;
        k = ( e.key === "Home" ) ? "home" : k;
        k = ( e.key === "End" ) ? "end" : k;
        k = ( e.key === "Escape" ) ? "escape" : k;
        return k;
    }
};

var betogether = {
    addButtonListeners: function() {
        const buttonArray = document.querySelectorAll( "a.betogether-control" );
        if ( dpTools.ns( buttonArray ) ) {
            for (let i = 0; i < buttonArray.length; i++) {
                buttonArray[i].addEventListener( "click", function( e ) { betogether.event( e ); });
                buttonArray[i].onkeydown = function( e ) {
                    keystroke = dpTools.getKeystrokeNames( e );
                    if ( ( keystroke == "enter" || keystroke == "spacebar" ) ) {
                      e.preventDefault();
                      betogether.event( e );
                    }
                }
            }
        }
    },
    event: function( e ) {
        e.preventDefault();
        const button = document.activeElement;
        betogether.run( button );
    },
    run: function( button ) {
        const buttonArray = document.querySelectorAll( "a.betogether-control" );
        if ( dpTools.ns( buttonArray )) {
            buttonArray.forEach(element => {
                let slideArray = ( dpTools.nn( element.dataset.slide ) ) ? document.querySelectorAll('div#' + element.dataset.slide) : null;
                if (element.id === button.id) {
                    dpTools.toggleButton( element, "on" );
                    if ( dpTools.nn( slideArray ) ) slideArray[0].classList.remove( 'off' );
                } else {
                    dpTools.toggleButton( element, "off" );
                    if ( dpTools.nn( slideArray ) ) slideArray[0].classList.add( 'off' );
                }
            });
        }
    }
};

window.onload = function() {
    betogether.addButtonListeners();
};