/**
 * Config
 */

const FADE_OUT_TIME = 2;
const FADE_IN_TIME = 2;
const FADE_IN_DELAY = 0.5;

const LOCK_TIME = 2;
const SHORT_LOCK_TIME = 0.5;

const SCROLL_TRSHOLD = 10;
const SWIPE_TRSHOLD = 10;

const SCROLL_ACTION_THRESHOLD = 40;

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

let allWrappers = [];
let contentWrappers = [];
let presentationWrappers = [];

let canScroll = true;
let fadeOutInterval = null;
let fadeInInterval = null;
let swipeStartY = null;
let scrollResetter = null;
let inShortTransition = false;
let inLongTransition = false;
let capturingScroll = false;

const setup = () => {
    [].forEach.call(document.getElementsByClassName('wrapper'), element => {
        const anyWrapper = {
            wrapper: element,
            sections: element.getElementsByClassName('block'),
            sectionsLen: 0
        };
        anyWrapper.sectionsLen = anyWrapper.sections.length;

        allWrappers.push(anyWrapper);
    });

    [].forEach.call(document.getElementsByClassName('wrapper-content'), element => {
        const contentWrapper = {
            wrapper: element,
            sections: element.getElementsByClassName('item-block'),
            sectionsLen: 0
        };
        contentWrapper.currentSection = contentWrapper.sections[contentWrapper.currentSectionIndex];
        contentWrapper.sectionsLen = contentWrapper.sections.length;

        contentWrappers.push(contentWrapper);
    });

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

        // TODO - mobile
        presentation.wrapper.addEventListener('touchstart', handleTouchStart, { passive: false });
        presentation.wrapper.addEventListener('touchmove', handleTouchMove, { passive: false });

        presentationWrappers.push(presentation);
    });

    document.body.addEventListener('wheel', (event) => {
        throttle(handleMouseScroll(event), 1000)
    }, { passive: false });
};

const resetScroll = () => {
    scrollResetter = setTimeout(() => { canScroll = true; }, 1000 * LOCK_TIME);
};

/**
 * Scroll animations
 */

const handleScroll = async (presentation, currentSection, nextSection, dir = 1) => {
    hideSlides(presentation);
    
    let cloneCurrent = currentSection.cloneNode(true);
    cloneCurrent.id = 'tempSectionCurrent';
    cloneCurrent.classList.add('section-clone');
    cloneCurrent.style.animation = `fadeOutDownBg ${FADE_OUT_TIME}s ${FADE_OUT_BG_FUNC} forward 0s`;
    presentation.wrapper.appendChild(cloneCurrent);
    
    // let cloneBg = currentSection.cloneNode(true);
    // cloneBg.id = 'tempSectionBg';
    // cloneBg.classList.add('copy-bg');
    // cloneBg.classList.add('section-clone');
    // presentation.wrapper.appendChild(cloneBg);
    
    let cloneNext = nextSection.cloneNode(true);
    cloneNext.id = 'tempSectionNext';
    cloneNext.classList.add('section-clone');
    cloneNext.style.opacity = 0;
    presentation.wrapper.appendChild(cloneNext);
    
    // fade out
    if (dir) {
        cloneCurrent.style.animation = `fadeOutDown ${FADE_OUT_TIME}s ${FADE_OUT_FUNC} 0s`;
        // cloneBg.style.animation = `fadeOutDownBg ${FADE_OUT_TIME}s ${FADE_OUT_BG_FUNC} forwards 0s`;
    }
    else {
        cloneCurrent.style.animation = `fadeOutUp ${FADE_OUT_TIME}s ${FADE_OUT_FUNC} 0s`;
        // cloneBg.style.animation = `fadeOutUpBg ${FADE_OUT_TIME}s ${FADE_OUT_BG_FUNC} forwards 0s`;
    }
    setTimeout(() => {
        presentation.wrapper.removeChild(cloneCurrent);
        // presentation.wrapper.removeChild(cloneBg);
        currentSection.style.opacity = 0;
    }, 1000 * FADE_OUT_TIME);
    
    // fade in
    if (dir) cloneNext.style.animation = `fadeInDown ${FADE_IN_TIME}s ${FADE_IN_FUNC} forwards ${FADE_IN_DELAY}s`;
    else cloneNext.style.animation = `fadeInUp ${FADE_IN_TIME}s ${FADE_IN_FUNC} forwards ${FADE_IN_DELAY}s`;
    setTimeout(() => {
        presentation.wrapper.removeChild(cloneNext);
        nextSection.scrollIntoView();
        
        showSlides(presentation);
        inLongTransition = false;
    }, 700*FADE_OUT_TIME + 700*FADE_IN_DELAY + 700*FADE_IN_TIME);
};

/**
 * Desktop scroll
 */

const handleKeyboardScroll = async (event) => {
    if ([' ', 'Space', 'ArrowDown', 'ArrowRight'].indexOf(event.key) > -1) {
        event['deltaY'] = 100;
        handleMouseScroll(event);
    }
    if (['ArrowUp', 'ArrowLeft'].indexOf(event.key) > -1) {
        event['deltaY'] = -100;
        handleMouseScroll(event);
    }
};

const handleMouseScroll = async (event) => {
    event.preventDefault();

    if (inLongTransition || inShortTransition) {
        setTimeout(() => { inShortTransition = false }, SHORT_LOCK_TIME);
        return;
    }
    
    if (Math.abs(event.deltaY) < SCROLL_ACTION_THRESHOLD) {
        var doc = document.documentElement;
        var top = (window.pageYOffset || doc.scrollTop) - (doc.clientTop || 0);

        scroll(0, top + event.deltaY)
        return;
    }

    /**
     * Regular section scroll
     */
    let contentWrapper = getContentWrapper(event, contentWrappers);

    if (contentWrapper) {
        inShortTransition = true;
        let topBlockInd = 0;

        // scroll down
        if (event.deltaY > 0) {
            for (let ind = 0; ind < contentWrapper.sectionsLen; ind++) {
                if (contentWrapper.sections[ind].getBoundingClientRect().y < 10) {
                    topBlock = contentWrapper.sections[ind];
                    topBlockInd = ind;
                }
            }
            try { event.preventDefault(); } catch (e) {}
            if (0 <= topBlockInd && topBlockInd < contentWrapper.sectionsLen - 1) {
                contentWrapper.sections[topBlockInd + 1].scrollIntoView({behavior: 'smooth'});
            } else {
                let currentWrapperInd = allWrappers.findIndex(w => w.wrapper.id === contentWrapper.wrapper.id);
                if (0 <= currentWrapperInd && currentWrapperInd < allWrappers.length) {
                    allWrappers[currentWrapperInd + 1].wrapper.scrollIntoView({behavior: 'smooth'});
                }
            }
            return;
        }
        // scroll up 
        else {
            for (let ind = 0; ind < contentWrapper.sectionsLen; ind++) {
                if (contentWrapper.sections[ind].getBoundingClientRect().y < 10) {
                    topBlock = contentWrapper.sections[ind];
                    topBlockInd = ind;
                }
            }
            try { event.preventDefault(); } catch (e) {}
            if (0 < topBlockInd && topBlockInd < contentWrapper.sectionsLen) {
                contentWrapper.sections[topBlockInd - 1].scrollIntoView({behavior: 'smooth'});
            } else {
                let currentWrapperInd = allWrappers.findIndex(w => w.wrapper.id === contentWrapper.wrapper.id);
                if (0 < currentWrapperInd && currentWrapperInd < allWrappers.length) {
                    
                    let targetWrapper = allWrappers[currentWrapperInd - 1].sections[allWrappers[currentWrapperInd - 1].sectionsLen - 1];
                    targetWrapper.scrollIntoView({behavior: 'smooth'});
                }
            }
        }
        return;
    }

    /**
     * Presentation section scroll
     */
    let presentationWrapper = getPresentationWrapper(event, presentationWrappers);
    
    if (presentationWrapper) {
        canScroll = false;
        try { event.preventDefault(); } catch (e) {}
        
        let topSlideInd = 0;
        for (let ind = 0; ind < presentationWrapper.sectionsLen; ind++) {
            if (presentationWrapper.sections[ind].getBoundingClientRect().y < 10) {
                topSlide = presentationWrapper.sections[ind];
                topSlideInd = ind;
            }
        }

        // scroll down
        if (event.deltaY > 0) {
            if (0 <= topSlideInd && topSlideInd < presentationWrapper.sectionsLen - 1) {
                inLongTransition = true;

                let currentSection = presentationWrapper.sections[topSlideInd];
                let nextSection = presentationWrapper.sections[topSlideInd + 1];
                presentationWrapper.wrapper.scrollIntoView({behavior: 'auto'});
                handleScroll(presentationWrapper, currentSection, nextSection, 1);
            } else {
                let currentWrapperInd = allWrappers.findIndex(w => w.wrapper.id === presentationWrapper.wrapper.id);
                if (0 <= currentWrapperInd && currentWrapperInd < allWrappers.length - 1) {
                    inShortTransition = true;

                    allWrappers[currentWrapperInd + 1].wrapper.scrollIntoView({behavior: 'smooth'});
                }
            }
        }
        // scroll up
        else {
            if (0 < topSlideInd && topSlideInd <= presentationWrapper.sectionsLen - 1) {
                inLongTransition = true;

                let currentSection = presentationWrapper.sections[topSlideInd];
                let nextSection = presentationWrapper.sections[topSlideInd - 1];
                presentationWrapper.wrapper.scrollIntoView({behavior: 'auto'});
                handleScroll(presentationWrapper, currentSection, nextSection, 0);
            } else {
                let currentWrapperInd = allWrappers.findIndex(w => w.wrapper.id === presentationWrapper.wrapper.id);
                if (0 < currentWrapperInd && currentWrapperInd < allWrappers.length) {
                    inShortTransition = true;

                    let targetWrapper = allWrappers[currentWrapperInd - 1].sections[allWrappers[currentWrapperInd - 1].sectionsLen - 1];
                    targetWrapper.scrollIntoView({behavior: 'smooth'});
                }
            }
        }
        return;
    }
};

/**
 * Mobile swipe
 */

const handleTouchStart = (event) => {
    const firstTouch = event.touches[0];
    swipeStartY = firstTouch.clientY;
};
 
const handleTouchMove = (event) => {
    return;
    if (!swipeStartY || !canScroll) return;

    var swipeEndY = event.touches[0].clientY;
    var swipeDiffY = swipeStartY - swipeEndY;

    let presentation = null;
    for (let ind = 0; ind < presentationWrappers.length; ind++) {
        if (presentationWrappers[ind].wrapper === event.target || presentationWrappers[ind].wrapper.contains(event.target)) {
            presentation = presentationWrappers[ind];
            break;
        }
    }

    if (
        !presentation
        || (swipeDiffY > SCROLL_TRSHOLD && presentation.currentSectionIndex >= presentation.sectionsLen - 1)
        || (swipeDiffY < -SCROLL_TRSHOLD && presentation.currentSectionIndex <= 0)
    ) return;
    
    canScroll = false;
    try { event.preventDefault(); } catch (e) {}
    setTimeout(() => {
        presentation.sections[0].scrollIntoView(true);
    }, 100);

    if (swipeDiffY > SWIPE_TRSHOLD && presentation.currentSectionIndex < presentation.sectionsLen - 1) {
        let nextSection = presentation.sections[presentation.currentSectionIndex + 1];
        handleScroll(presentation, presentation.currentSection, nextSection, 1);
        presentation.currentSectionIndex += 1;
        presentation.currentSection = nextSection;
    }
    if (swipeDiffY < -SWIPE_TRSHOLD && presentation.currentSectionIndex > 0) {
        let nextSection = presentation.sections[presentation.currentSectionIndex - 1];
        handleScroll(presentation, presentation.currentSection, nextSection, 0);
        presentation.currentSectionIndex -= 1;
        presentation.currentSection = nextSection;
    }
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
