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
        betogether.mouseoverListener();
        betogether.scrollListener();
        betogether.tabIsInBackgroundListener();
        betogether.startSlideTimer();
    },
    getLastPauseType() {
        const pauseButtonArray = betogether.getNodeList( "pause button" );
        let result = "";
        if ( dpTools.ns( pauseButtonArray ) ) {
            result = "";
            let pauseButton = pauseButtonArray[0];
            let lastPauseType = pauseButton.dataset.last_pause_type;
            if ( dpTools.nn( lastPauseType ) ) {
                result = lastPauseType;
            }
        }
        return result;
    },
    getNodeList( query ) {
        let array = [];
        let queryObject = {
            "active slide" : "div.betogether-slide:not(.off)",
            "active slide button" :
                "a.betogether-slide-button[aria-pressed='true']",
            "all slide buttons" : "a.betogether-slide-button",
            "all slides" : "div.betogether-slide",
            "pause button" : "a#betogether-pause-button",
            "progress bar" : "div#betogether-progress-bar",
            "slide container" : "div#betogether-slide-container",
            "slider container" : "div#betogether-container"
        };
        return document.querySelectorAll( queryObject[ query ] );
    },
    isSliderPlaying() {
        const pauseButtonArray = betogether.getNodeList( "pause button" );
        let result = "no";
        if ( dpTools.ns( pauseButtonArray ) ) {
            let pauseButton = pauseButtonArray[0];
            result = ( dpTools.getButtonStatus( pauseButton ) === "off" ) ?
            "yes" :
            result;
        }
        return result;
    },
    mouseoverListener() {
        const sliderMainContainerArray = betogether.getNodeList(
            "slider container"
        );
        const slideContainerArray = betogether.getNodeList(
            "slide container"
        );
        if (
            dpTools.ns( sliderMainContainerArray ) &&
            dpTools.ns( slideContainerArray )
        ) {
            let sliderMainContainer = sliderMainContainerArray[0];
            let slideContainer = slideContainerArray[0];
            if ( sliderMainContainer.classList.contains(
                "pause-on-mouseover"
                )
            ) {
                slideContainer.onmouseenter = function(e) {
                    if ( sliderMainContainer.classList.contains(
                        "pause-on-mouseover"
                        ) ) {
                        betogether.toggleSliderPausePlay(
                            "pause",
                            "nonclick mouseover"
                        );
                    }
                };
                slideContainer.onmouseout = function(e) {
                    if (
                        sliderMainContainer.classList.contains(
                            "pause-on-mouseover"
                            ) &&
                        betogether.getLastPauseType() !== "click"
                    ) {
                        betogether.toggleSliderPausePlay(
                            "play",
                            "nonclick mouseover"
                        );
                    }
                };
            }
        }
    },
    nextSlide() {
        const slideButtonArray = betogether.getNodeList( "all slide buttons" );
        const activeSlideButtonArray = betogether.getNodeList(
            "active slide button"
        );
        const slideArray = betogether.getNodeList( "all slides" );
        if (
            dpTools.ns( activeSlideButtonArray ) &&
            dpTools.ns( slideButtonArray )
        ) {
            let currentSlideButton = activeSlideButtonArray[0];
            let currentSlideNumber = (
                dpTools.nn( currentSlideButton.dataset.slide )
                ) ?
                Number( currentSlideButton.dataset.slide ) :
                1;
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
    scrollListener() {
        let sliderIsInViewOnLoad = betogether.sliderIsInViewport();
        if ( sliderIsInViewOnLoad === "no" ) {
            betogether.toggleSliderPausePlay( "pause", "click" );
        }
        window.onscroll = function (e) {
            const sliderMainContainerArray = betogether.getNodeList(
                "slider container"
            );
            const slideContainerArray = betogether.getNodeList(
                "slide container"
            );
            if ( dpTools.ns(
                sliderMainContainerArray ) &&
                dpTools.ns( slideContainerArray )
            ) {
                let sliderMainContainer = sliderMainContainerArray[0];
                if ( sliderMainContainer.classList.contains(
                        "pause_on_scroll"
                    )
                ) {
                    betogether.toggleSliderPausePlay( "pause", "click" );
                    betogether.toggleMouseoverListener( "remove" );
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
        const slideContainerArray = betogether.getNodeList( "slide container" );
        let result = "";
        if ( dpTools.ns( slideContainerArray ) ) {
            let slideContainer = slideContainerArray[0];
            let pauseHeight = 0.5 *
                ( dpTools.getElementHeight(slideContainer ) );
            let elementIsInViewport = dpTools.elementIsInViewport(
                slideContainer,
                pauseHeight
            );
            result = ( elementIsInViewport === "yes" ) ? "yes" : "no";
        }
        return result;
    },
    startSlideTimer() {
        const activeSlideArray = betogether.getNodeList( "active slide" );
        if ( dpTools.ns( activeSlideArray ) ) {
            betogether.togglePauseButtonAndRecordPauseType(
                "off",
                betogether.getLastPauseType()
            );
            const currentSlide = activeSlideArray[0];
            const totalDuration = Number( currentSlide.dataset.duration );
            const startPosition = resumeOrPlayFromStart( currentSlide.id );
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
        function resumeOrPlayFromStart( currentSlideButtonID ) {
            const progressBarArray = betogether.getNodeList( "progress bar" );
            let result = "play-from-start";
            if ( dpTools.ns( progressBarArray ) ) {
                let progressbar = progressBarArray[0];
                if ( dpTools.nn( progressbar.dataset.last_slide_button_id ) ) {
                    result = (
                        progressbar.dataset.last_slide_button_id ===
                        currentSlideButtonID
                    ) ?
                    "resume" :
                    result;
                }
                progressbar.dataset.last_slide_button_id = currentSlideButtonID;
            }
            return result;
        }
        function getProgressBarElapsedTime() {
            const progressBarArray = betogether.getNodeList( "progress bar" );
            if ( dpTools.ns( progressBarArray ) ) {
                let progressbar = progressBarArray[0];
                return ( dpTools.nn( progressbar.dataset.elapsed_time ) ) ?
                    Number( progressbar.dataset.elapsed_time ) :
                    0;
            }
        }
        function updateProgressBarLength( elapsedTime, totalDuration ) {
            const progressBarArray = betogether.getNodeList( "progress bar" );
            if ( dpTools.ns( progressBarArray ) ) {
                let progressbar = progressBarArray[0];
                let rateDone = elapsedTime / totalDuration;
                let percentDone = dpTools.convertRateToPercent( rateDone );
                progressbar.style.width = percentDone + "%";
                progressbar.dataset.elapsed_time = elapsedTime;
            }
        }
    },
    startSlider() {
        betogether.addListeners();
    },
    startThisSlide( slideButton ) {
        const slideButtonArray = betogether.getNodeList( "all slide buttons" );
        const slideArray = betogether.getNodeList( "all slides" );
        betogether.toggleSliderPausePlay( "pause", "null" );
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
    },
    tabIsInBackgroundListener() {
        document.onvisibilitychange = function( e ) {
            let lastPauseType = betogether.getLastPauseType();
            if ( betogether.isSliderPlaying() === "yes" ) {
                betogether.toggleSliderPausePlay( "pause", "click" );
            }
        };

    },
    toggleMouseoverListener( action ) {
        const sliderMainContainerArray = betogether.getNodeList(
            "slider container"
        );
        if ( dpTools.ns( sliderMainContainerArray ) ) {
            let sliderMainContainer = sliderMainContainerArray[0];
            dpTools.toggleCSS(
                sliderMainContainer,
                action,
                "pause-on-mouseover"
            );
        }
    },
    togglePauseButtonAndRecordPauseType( action, pauseType ) {
        const pauseButtonArray = betogether.getNodeList( "pause button" );
        if ( dpTools.ns( pauseButtonArray ) ) {
            let pauseButton = pauseButtonArray[0];
            dpTools.toggleButton( pauseButton, action );
            if (
                pauseType !== "null" &&
                (
                    pauseType === "click" ||
                    dpTools.stringContains( pauseType, "nonclick" ) === "yes"
                )
            ) {
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