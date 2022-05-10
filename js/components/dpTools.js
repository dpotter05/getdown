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

