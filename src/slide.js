/**
 * Config
 */

const FADE_OUT_TIME = 3;
const FADE_IN_TIME = 3;
const FADE_IN_DELAY = 1;

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

// { currentSection: s1, currentSectionIndex = 0, wrapper: element, sections: [s1, s2 ...], sectionsLen: 3 }
let presentations = []; 

let canScroll = true;
let fadeOutInterval = null;
let fadeInInterval = null;
let swipeStartY = null;

const setup = () => {
    [].forEach.call(document.getElementsByClassName('wrapper-sections'), element => {
        const presentation = {
            currentSection: null,
            currentSectionIndex: 0,
            wrapper: element,
            sections: element.getElementsByClassName('section'),
            sectionsLen: 0
        };
        presentation.currentSection = presentation.sections[presentation.currentSectionIndex];
        presentation.sectionsLen = presentation.sections.length;
        
        resetState(presentation);
        presentation.currentSection.style.opacity = 1;

        presentation.wrapper.addEventListener('wheel', (event) => {
            handleMouseScroll(event);
        });

        presentations.push(presentation);
    });
};

const resetState = (presentation) => {
    for (let ind = 0; ind < presentation.sectionsLen; ind++) {
        presentation.sections[ind].style.opacity = 0;
    }
};

const resetScroll = () => {
    setTimeout(() => { canScroll = true; }, 1000 * LOCK_TIME);
};

/**
 * Scroll animations
 */

const handleScroll = async (presentation, currentSection, nextSection, dir = 1) => {
    resetState(presentation);
    currentSection.style.opacity = 1;

    let cloneBg = currentSection.cloneNode(true);
    cloneBg.id = 'tempSectionSide';
    cloneBg.classList.add('copy-bg');
    presentation.wrapper.appendChild(cloneBg);
    
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
        presentation.wrapper.removeChild(cloneBg);
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
    // canScroll = false;

    console.log(event)

    let presentation = null;
    for (let ind = 0; ind < presentations.length; ind++) {
        if (presentations[ind].wrapper === event.target || presentations[ind].wrapper.contains(event.target)) {
            presentation = presentations[ind];
            break;
        }
    }

    if (
        !presentation
        || presentation.currentSectionIndex > presentation.sectionsLen - 1
        || presentation.currentSectionIndex < 0
    ) return;
    event.preventDefault();
    setTimeout(() => {
        presentation.wrapper.scrollIntoView({behavior: 'smooth', block: 'end', inline: 'nearest'});
    }, 0);

    if ([' ', 'Space', 'ArrowDown', 'ArrowRight'].indexOf(event.key) > -1 && presentation.currentSectionIndex < presentation.sectionsLen - 1) {
        let nextSection = presentation.sections[presentation.currentSectionIndex + 1];
        handleScroll(presentation, presentation.currentSection, nextSection, 1);
        presentation.currentSectionIndex += 1;
        presentation.currentSection = nextSection;
    }
    if (['ArrowUp', 'ArrowLeft'].indexOf(event.key) > -1 && presentation.currentSectionIndex > 0) {
        let nextSection = presentation.sections[presentation.currentSectionIndex - 1];
        handleScroll(presentation, presentation.currentSection, nextSection, 0);
        presentation.currentSectionIndex -= 1;
        presentation.currentSection = nextSection;
    }

    resetScroll();
};

const handleMouseScroll = (event) => {
    if (!canScroll) return;
    canScroll = false;

    let presentation = null;
    for (let ind = 0; ind < presentations.length; ind++) {
        if (presentations[ind].wrapper === event.target || presentations[ind].wrapper.contains(event.target)) {
            presentation = presentations[ind];
            break;
        }
    }

    if (
        !presentation
        || presentation.currentSectionIndex > presentation.sectionsLen - 1
        || presentation.currentSectionIndex < 0
    ) return;
    event.preventDefault();
    setTimeout(() => {
        presentation.wrapper.scrollIntoView({behavior: 'smooth', block: 'end', inline: 'nearest'});
    }, 100);

    if (event.deltaY > SCROLL_TRSHOLD && presentation.currentSectionIndex < presentation.sectionsLen - 1) {
        let nextSection = presentation.sections[presentation.currentSectionIndex + 1];
        handleScroll(presentation, presentation.currentSection, nextSection, 1);
        presentation.currentSectionIndex += 1;
        presentation.currentSection = nextSection;
    }
    if (event.deltaY < -SCROLL_TRSHOLD && presentation.currentSectionIndex > 0) {
        let nextSection = presentation.sections[presentation.currentSectionIndex - 1];
        handleScroll(presentation, presentation.currentSection, nextSection, 0);
        presentation.currentSectionIndex -= 1;
        presentation.currentSection = nextSection;
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
