/**
 * Config
 */

const FADE_OUT_TIME = 4.5;
const FADE_IN_TIME = 4.5;
const FADE_IN_DELAY = 2.0;
const FADE_IN_FINISHER_DELAY = 1;

const LOCK_TIME = 500;

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
    }
};

const resetScroll = () => {
    setTimeout(() => { canScroll = true; }, LOCK_TIME);
};

/**
 * Scroll animations
 */

const handleScroll = async (currentSection, nextSection, dir = 1) => {
    resetState();
    currentSection.style.opacity = 1;
    
    // fade out
    if (dir) currentSection.style.animation = `fadeOutDown ${FADE_OUT_TIME}s cubic-bezier(.86,.24,.24,.94) forwards 0s`;
    else currentSection.style.animation = `fadeOutUp ${FADE_OUT_TIME}s cubic-bezier(.86,.24,.24,.94) forwards 0s`;

    // fade in
    if (dir) nextSection.style.animation = `fadeInDown ${FADE_IN_TIME}s cubic-bezier(.5,.47,.21,1.22) forwards ${FADE_IN_DELAY}s`;
    else nextSection.style.animation = `fadeInUp ${FADE_IN_TIME}s cubic-bezier(.5,.47,.21,1.22) forwards ${FADE_IN_DELAY}s`;
};

/**
 * Desktop scroll
 */

const handleKeyboardScroll = async (event) => {
    if (!canScroll) return;
    canScroll = false;

    if ([" ", "Space", "ArrowDown", "ArrowRight"].indexOf(event.key) > -1 && currentSectionIndex < sections.length - 1) {
        let nextSection = sections[currentSectionIndex + 1];
        handleScroll(currentSection, nextSection, 1);
        currentSectionIndex += 1;
        currentSection = nextSection;
    }
    if (["ArrowUp", "ArrowLeft"].indexOf(event.key) > -1 && currentSectionIndex > 0) {
        let nextSection = sections[currentSectionIndex - 1];
        handleScroll(currentSection, nextSection, 0);
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
        handleScroll(currentSection, nextSection, 1);
        currentSectionIndex += 1;
        currentSection = nextSection;
    }
    if (event.deltaY < -SCROLL_TRSHOLD && currentSectionIndex > 0) {
        let nextSection = sections[currentSectionIndex - 1];
        handleScroll(currentSection, nextSection, 0);
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
        handleScroll(currentSection, nextSection, 1);
        currentSectionIndex += 1;
        currentSection = nextSection;
    }
    if (swipeDiffY < -SWIPE_TRSHOLD && currentSectionIndex > 0) {
        let nextSection = sections[currentSectionIndex - 1];
        handleScroll(currentSection, nextSection, 0);
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
window.addEventListener("keydown", handleKeyboardScroll);
document.addEventListener("touchstart", handleTouchStart, false);
document.addEventListener("touchmove", handleTouchMove, false);
