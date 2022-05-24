/**
 * Config
 */
const FADE_OUT_TIME = 1000;
const FADE_IN_DELAY = 1000;
const FADE_IN_TIME = 1000;
const FADE_IN_DISTANCE = 45;
const FADE_OUT_DISTANCE = 55;
const FADE_OUT_RES = FADE_OUT_TIME / 4;
const FADE_IN_RES = FADE_IN_TIME / 4;

const SCROLL_LOCK = 100 + (FADE_IN_TIME + FADE_OUT_TIME + FADE_IN_DELAY);

const SCROLL_TRSHOLD = 1;
const SWIPE_TRSHOLD = 1;

/**
 * State
 */
let currentSection = null;
let currentSectionIndex = 0;
let sections = [];
let canScroll = true;
let fadeOutInterval = null;
let fadeInInterval = null;
let swipeStartY = null;


const setup = () => {
    sections = document.getElementsByClassName("section");
  
    resetState();
  
    currentSection = sections[currentSectionIndex];
    currentSection.style.opacity = 1;
  
    let mainWrapper = document.getElementById("wrapper-sections");
    mainWrapper.addEventListener("wheel", (event) => {
      handleMouseScroll(event);
    });
};


const resetState = () => {
    for (let ind = 0; ind < sections.length; ind++) {
        sections[ind].style.opacity = 0;
        sections[ind].style.bottom = 0;
    }
    clearInterval(fadeOutInterval);
    fadeOutInterval = null;
    clearInterval(fadeInInterval);
    fadeInInterval = null;
};


const resetScroll = () => {
    setTimeout(() => { canScroll = true; console.log('can scroll') }, SCROLL_LOCK);
};


/**
 * Scroll animation
 */
const scrollDown = async (currentSection, nextSection) => {
    resetState();
    currentSection.style.opacity = 1;

    // fade out current section
    let fadeOutStep = 0;
    let fadeOutOpacity = 1;
    let fadeOutDistance = 0;
    fadeOutInterval = setInterval(() => {
        fadeOutStep++;
        if (fadeOutStep >= FADE_OUT_RES)  { clearInterval(fadeOutInterval); return; }

        fadeOutOpacity = (FADE_OUT_RES - 1.5 * fadeOutStep) / FADE_OUT_RES;
        fadeOutDistance = (fadeOutStep * (1 + fadeOutStep / 700)) * FADE_OUT_DISTANCE / FADE_OUT_RES;

        currentSection.style.opacity = fadeOutOpacity;
        currentSection.style.bottom = fadeOutDistance + "rem";
    }, FADE_OUT_TIME / FADE_OUT_RES);
    
    setTimeout(() => {
        currentSection.style.opacity = 0;
        currentSection.style.bottom = 0;
    }, 1.1 * FADE_OUT_TIME);

    // fade in next section
    let fadeInStep = 0;
    let fadeInOpacity = 0;
    let fadeInDistance = -FADE_IN_DISTANCE;
    setTimeout(() => {
        fadeInInterval = setInterval(() => {
            fadeInStep++;
            if (fadeInStep >= FADE_IN_RES)  { clearInterval(fadeInInterval); return; }

            fadeInOpacity += 1.1 / FADE_IN_RES;
            fadeInDistance = 0.8 * (FADE_IN_DISTANCE * FADE_IN_RES * Math.tanh((0.25*FADE_IN_RES + 3*fadeInStep) / FADE_IN_RES)
                 - FADE_IN_DISTANCE * FADE_IN_RES) / (FADE_IN_RES);

            nextSection.style.opacity = fadeInOpacity;
            nextSection.style.bottom = fadeInDistance + "rem";

        }, FADE_IN_TIME / FADE_IN_RES);
        
        setTimeout(() => {
            resetState();
            nextSection.style.opacity = 1;
        }, 1.1 * FADE_IN_TIME);
    }, 1.1 * FADE_IN_DELAY);
};


const scrollUp = async (currentSection, nextSection) => {
    resetState();
    currentSection.style.opacity = 1;

    // fade out current section
    let fadeOutStep = 0;
    let fadeOutOpacity = 1;
    let fadeOutDistance = 0;
    fadeOutInterval = setInterval(() => {
        fadeOutStep++;
        if (fadeOutStep >= FADE_OUT_RES) { clearInterval(fadeOutInterval); return; }

        fadeOutOpacity = (FADE_OUT_RES - 1.5 * fadeOutStep) / FADE_OUT_RES;
        fadeOutDistance = -(fadeOutStep * (1 + fadeOutStep / 700)) * FADE_OUT_DISTANCE / FADE_OUT_RES;

        currentSection.style.opacity = fadeOutOpacity;
        currentSection.style.bottom = fadeOutDistance + "rem";
    }, FADE_OUT_TIME / FADE_OUT_RES);
    
    setTimeout(() => {
        currentSection.style.opacity = 0;
        currentSection.style.bottom = 0;
    }, 1.1 * FADE_OUT_TIME);

    // fade in next section
    let fadeInStep = 0;
    let fadeInOpacity = 0;
    let fadeInDistance = FADE_IN_DISTANCE;
    setTimeout(() => {
        fadeInInterval = setInterval(() => {
            fadeInStep++;
            if (fadeInStep >= FADE_IN_RES) { clearInterval(fadeInInterval); return}

            fadeInOpacity += 1.1 / FADE_IN_RES;
            fadeInDistance = - 0.8 * (FADE_IN_DISTANCE * FADE_IN_RES * Math.tanh((0.25*FADE_IN_RES + 3*fadeInStep) / FADE_IN_RES)
            - FADE_IN_DISTANCE * FADE_IN_RES) / (FADE_IN_RES);

            nextSection.style.opacity = fadeInOpacity;
            nextSection.style.bottom = fadeInDistance + "rem";
        }, FADE_IN_TIME / FADE_IN_RES);
        
        setTimeout(() => {
            resetState();
            nextSection.style.opacity = 1;
        }, 1.1 * FADE_IN_TIME);
    }, 1.1 * FADE_IN_DELAY);
};


/**
 * Desktop scroll
 */
const handleScroll = async (event) => {
    if (!canScroll) return;
    canScroll = false;

    if ([" ", "Space", "ArrowDown", "ArrowRight"].indexOf(event.key) > -1 && currentSectionIndex < sections.length - 1) {
        let nextSection = sections[currentSectionIndex + 1];
        scrollDown(currentSection, nextSection);
        currentSectionIndex += 1;
        currentSection = nextSection;
    }
    if (["ArrowUp", "ArrowLeft"].indexOf(event.key) > -1 && currentSectionIndex > 0) {
        let nextSection = sections[currentSectionIndex - 1];
        scrollUp(currentSection, nextSection);
        currentSectionIndex -= 1;
        currentSection = nextSection;
    }

    resetScroll();
};


const handleMouseScroll = (event) => {
    if (!canScroll) return;
    canScroll = false;

    if (event.deltaY > SCROLL_TRSHOLD && currentSectionIndex < sections.length - 1) {
        let nextSection = sections[currentSectionIndex + 1];
        scrollDown(currentSection, nextSection);
        currentSectionIndex += 1;
        currentSection = nextSection;
    }
    if (event.deltaY < -SCROLL_TRSHOLD && currentSectionIndex > 0) {
        let nextSection = sections[currentSectionIndex - 1];
        scrollUp(currentSection, nextSection);
        currentSectionIndex -= 1;
        currentSection = nextSection;
    }

    resetScroll();
};


/**
 * Mobile scroll (swipe)
 */
const handleTouchStart = (event) => {
    const firstTouch = event.touches[0];
    swipeStartY = firstTouch.clientY;
};

const handleTouchMove = (event) => {
    if (!swipeStartY || !canScroll) return;
    canScroll = false;

    var swipeEndY = event.touches[0].clientY;
    var swipeDiffY = swipeStartY - swipeEndY;

    if (swipeDiffY > SWIPE_TRSHOLD && currentSectionIndex < sections.length - 1) {
        let nextSection = sections[currentSectionIndex + 1];
        scrollDown(currentSection, nextSection);
        currentSectionIndex += 1;
        currentSection = nextSection;
    }
    if (swipeDiffY < -SWIPE_TRSHOLD && currentSectionIndex > 0) {
        let nextSection = sections[currentSectionIndex - 1];
        scrollUp(currentSection, nextSection);
        currentSectionIndex -= 1;
        currentSection = nextSection;
    }

    resetScroll();
};


/**
 * Initialization
 */
window.addEventListener("keydown", (event) => {
    if ([" ", "Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].indexOf(event.code) > -1) {
        event.preventDefault();
    }
    }, false
);

window.addEventListener("load", setup);
window.addEventListener("keydown", handleScroll);
document.addEventListener("touchstart", handleTouchStart, false);
document.addEventListener("touchmove", handleTouchMove, false);
