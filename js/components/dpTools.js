const dpTools = {
    addAnchorButtonListeners( arrayString, object, eventName ) {
        const buttonArray = document.querySelectorAll( arrayString );
        if ( dpTools.ns( buttonArray ) ) {
            buttonArray.forEach( ( element ) => {
                element.onclick = function( e ) {
                    object[ eventName ]( e );
                };
            } );
        }
    },
    buttonIsOn( button ) {
        let status = button.getAttribute( "aria-pressed" );
        return ( status === "true" ) ? true : false;
    },
    convertRateToPercent( number ) {
        let percent = number * 100;
        return percent.toFixed(2);
    },
    elementIsInViewport( el, pixelsShowing ) {
        let rect = el.getBoundingClientRect();
        let math = window.innerHeight - rect.top;
        let testTop = ( math > pixelsShowing ) ? true : false;
        let testBottom = ( rect.bottom > pixelsShowing ) ? true : false;
        return ( testTop && testBottom ) ? "yes" : "no";
    },
    getElementHeight( element ) {
        let rect = element.getBoundingClientRect();
        let math1 = rect.top - rect.bottom;
        let math2 = rect.bottom - rect.top;
        return ( rect.top > rect.bottom ) ? math1 : math2;
    },
    getNextInArray( args ) {
        return ( args.pos + 1 < args.buttons.length ) ? args.pos + 1 : 0;
    },
    nn( content ) { // Not Null
        return ( content !== null ) ? true : false;
    },
    ns( nl ) { // Nodelist Set
        return ( nl && nl.length > 0 ) ? true : false;
    },
    toggleButton( button, action ) {
        let boolean = ( this.buttonIsOn( button ) ) ? false : true;
        boolean = ( action === "toggle" ) ? boolean : action;
        button.setAttribute( "aria-pressed", boolean );
    },
    toggleCSS( element, action, css ) {
        element.classList[action]( css );
    }
};