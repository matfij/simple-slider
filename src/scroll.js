/**
 * Config
 */
const TRANSITION_TIME = 500;
const TRANSITION_RESOLUTION = 100;
const FADE_IN_DISTANCE = 15;
const FADE_OUT_DISTANCE = 25;

const SCROLL_LOCK = 1 * 1200;
const SWIPE_LOCK = 1 * 1200;

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
let canSwipe = true;


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
    setTimeout(() => { canScroll = true; }, SCROLL_LOCK);
};

const resetSwipe = () => {
    setTimeout(() => { canSwipe = true; }, SCROLL_LOCK);
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
        if (fadeOutStep >= TRANSITION_RESOLUTION)  { clearInterval(fadeOutInterval); return; }

        fadeOutOpacity -= 1 / TRANSITION_RESOLUTION;
        fadeOutDistance += FADE_IN_DISTANCE / TRANSITION_RESOLUTION;

        currentSection.style.opacity = fadeOutOpacity;
        currentSection.style.bottom = fadeOutDistance + "rem";
    }, TRANSITION_TIME / TRANSITION_RESOLUTION);
    
    setTimeout(() => {
        currentSection.style.opacity = 0;
        currentSection.style.bottom = 0;
    }, 1.1 * TRANSITION_TIME);

    // fade in next section
    let fadeInStep = 0;
    let fadeInOpacity = 0;
    let fadeInDistance = -FADE_OUT_DISTANCE;
    setTimeout(() => {
        fadeInInterval = setInterval(() => {
            fadeInStep++;
            if (fadeInStep >= TRANSITION_RESOLUTION)  { clearInterval(fadeInInterval); return; }

            fadeInOpacity += 1 / TRANSITION_RESOLUTION;
            fadeInDistance += FADE_OUT_DISTANCE / TRANSITION_RESOLUTION;

            nextSection.style.opacity = fadeInOpacity;
            nextSection.style.bottom = fadeInDistance + "rem";
        }, TRANSITION_TIME / TRANSITION_RESOLUTION);
        
        setTimeout(() => {
            resetState();
            nextSection.style.opacity = 1;
        }, 1.1 * TRANSITION_TIME);
    }, 1.1 * TRANSITION_TIME);
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
        if (fadeOutStep >= TRANSITION_RESOLUTION) { clearInterval(fadeOutInterval); return; }

        fadeOutOpacity -= 1.5 / TRANSITION_RESOLUTION;
        fadeOutDistance -= FADE_IN_DISTANCE / TRANSITION_RESOLUTION;

        currentSection.style.opacity = fadeOutOpacity;
        currentSection.style.bottom = fadeOutDistance + "rem";
    }, TRANSITION_TIME / TRANSITION_RESOLUTION);
    
    setTimeout(() => {
        currentSection.style.opacity = 0;
        currentSection.style.bottom = 0;
    }, 1.1 * TRANSITION_TIME);

    // fade in next section
    let fadeInStep = 0;
    let fadeInOpacity = 0;
    let fadeInDistance = FADE_OUT_DISTANCE;
    setTimeout(() => {
        fadeInInterval = setInterval(() => {
            fadeInStep++;
            if (fadeInStep >= TRANSITION_RESOLUTION) { clearInterval(fadeInInterval); return}

            fadeInOpacity += 1 / TRANSITION_RESOLUTION;
            fadeInDistance -= FADE_OUT_DISTANCE / TRANSITION_RESOLUTION;

            nextSection.style.opacity = fadeInOpacity;
            nextSection.style.bottom = fadeInDistance + "rem";
        }, TRANSITION_TIME / TRANSITION_RESOLUTION);
        
        setTimeout(() => {
            resetState();
            nextSection.style.opacity = 1;
        }, 1.1 * TRANSITION_TIME);
    }, 1.1 * TRANSITION_TIME);
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

    if (event.deltaY > 0 && currentSectionIndex < sections.length - 1) {
        let nextSection = sections[currentSectionIndex + 1];
        scrollDown(currentSection, nextSection);
        currentSectionIndex += 1;
        currentSection = nextSection;
    }
    if (event.deltaY < 0 && currentSectionIndex > 0) {
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
    if (!swipeStartY || !canSwipe) return;
    canSwipe = false;

    var swipeEndY = event.touches[0].clientY;
    var swipeDiffY = swipeStartY - swipeEndY;

    if (swipeDiffY > 10 && currentSectionIndex < sections.length - 1) {
        let nextSection = sections[currentSectionIndex + 1];
        scrollDown(currentSection, nextSection);
        currentSectionIndex += 1;
        currentSection = nextSection; console.log('down', swipeDiffY);
    }
    if (swipeDiffY < -10 && currentSectionIndex > 0) {
        let nextSection = sections[currentSectionIndex - 1];
        scrollUp(currentSection, nextSection);
        currentSectionIndex -= 1;
        currentSection = nextSection; console.log('up', swipeDiffY);
    }

    resetSwipe();
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
window.addEventListener("keyup", resetScroll);
document.addEventListener("touchstart", handleTouchStart, false);
document.addEventListener("touchmove", handleTouchMove, false);
