/**
 * Config
 */

const FADE_OUT_TIME = 6;
const FADE_IN_TIME = 6;
const FADE_IN_DELAY = 2;

const LOCK_TIME = 0.5;

const SCROLL_TRSHOLD = 1;
const SWIPE_TRSHOLD = 1;

const FADE_INOUT_FUNCS = [
    'cubic-bezier(.58,.45,.41,.56)',  // lin
    'cubic-bezier(.37,.02,.45,.96)', // ease in out
    'cubic-bezier(.64,.42,.41,1)', // ease out +
    'cubic-bezier(.63,-0.03,.02,1.01)', // ease out ++
    'cubic-bezier(.37,.02,.26,1.37)', // bounce
];
const FADE_OUT_FUNC = FADE_INOUT_FUNCS[3];
const FADE_OUT_BG_FUNC = FADE_INOUT_FUNCS[0];
const FADE_IN_FUNC = FADE_INOUT_FUNCS[3];

/**
 * State
 */

let currentSection = null;
let currentSectionIndex = 0;
let sectionsWrapper = null;
let sections = [];
let sectionsLen = 0;
let canScroll = true;
let fadeOutInterval = null;
let fadeInInterval = null;
let swipeStartY = null;

const setup = () => {
    sections = document.getElementsByClassName('section');
    sectionsLen = sections.length;
    resetState();

    currentSection = sections[currentSectionIndex];
    currentSection.style.opacity = 1;

    sectionsWrapper = document.getElementById('wrapper-sections');
    sectionsWrapper.addEventListener('wheel', (event) => {
        handleMouseScroll(event);
    });
};

const resetState = () => {
    for (let ind = 0; ind < sectionsLen; ind++) {
        sections[ind].style.opacity = 0;
    }
};

const resetScroll = () => {
    setTimeout(() => { canScroll = true; }, 1000 * LOCK_TIME);
};

/**
 * Scroll animations
 */

const handleScroll = async (currentSection, nextSection, dir = 1) => {
    resetState();
    currentSection.style.opacity = 1;

    let cloneBg = currentSection.cloneNode(true);
    cloneBg.id = 'tempSectionSide';
    cloneBg.classList.add('copy-bg');
    sectionsWrapper.appendChild(cloneBg);
    
    // fade out
    if (dir) {
        currentSection.style.animation = `fadeOutDown ${FADE_OUT_TIME}s ${FADE_OUT_FUNC} forwards 0s`;
        cloneBg.style.animation = `fadeOutDownBg ${FADE_OUT_TIME}s ${FADE_OUT_BG_FUNC} forwards 0s`;
    }
    else {
        currentSection.style.animation = `fadeOutUp ${FADE_OUT_TIME}s ${FADE_OUT_FUNC} forwards 0s`;
        cloneBg.style.animation = `fadeOutUpBg ${FADE_OUT_TIME}s ${FADE_OUT_BG_FUNC} forwards 0s`;
    }
    setTimeout(() => {
        sectionsWrapper.removeChild(cloneBg);
    }, 1000 * FADE_OUT_TIME);

    // fade in
    if (dir) nextSection.style.animation = `fadeInDown ${FADE_IN_TIME}s ${FADE_IN_FUNC} forwards ${FADE_IN_DELAY}s`;
    else nextSection.style.animation = `fadeInUp ${FADE_IN_TIME}s ${FADE_IN_FUNC} forwards ${FADE_IN_DELAY}s`;
};

/**
 * Desktop scroll
 */

const handleKeyboardScroll = async (event) => {
    if (!canScroll) return;
    canScroll = false;

    if ([' ', 'Space', 'ArrowDown', 'ArrowRight'].indexOf(event.key) > -1 && currentSectionIndex < sectionsLen - 1) {
        let nextSection = sections[currentSectionIndex + 1];
        handleScroll(currentSection, nextSection, 1);
        currentSectionIndex += 1;
        currentSection = nextSection;
    }
    if (['ArrowUp', 'ArrowLeft'].indexOf(event.key) > -1 && currentSectionIndex > 0) {
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

    if (event.deltaY > SCROLL_TRSHOLD && currentSectionIndex < sectionsLen - 1) {
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

window.addEventListener('keydown', (event) => {
    if ([' ', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(event.code) > -1) {
        event.preventDefault();
    }
    }, false
);

window.addEventListener('load', setup);
window.addEventListener('keydown', handleKeyboardScroll);
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);
