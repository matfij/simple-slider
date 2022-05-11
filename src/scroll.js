const TRANSITION_TIME = 500;
const TRANSITION_RESOLUTION = 100;
const FADE_IN_DISTANCE = 15;
const FADE_OUT_DISTANCE = 25;

let currentSection = null;
let currentSectionIndex = 0;
let sections = [];
let canScroll = true;
let fadeOutInterval = null;
let fadeInInterval = null;


const resetState = () => {
    for (let ind = 0; ind < sections.length; ind++) {
        sections[ind].style.opacity = 0;
        sections[ind].style.bottom = 0;
    }
    clearInterval(fadeOutInterval);
    clearInterval(fadeInInterval);
}


const scrollDown = async (currentSection, nextSection) => {
    resetState();
    currentSection.style.opacity = 1;

    // fade out current section
    let fadeOutStep = 0;
    let fadeOutOpacity = 1;
    let fadeOutDistance = 0;
    fadeOutInterval = setInterval(() => {
        fadeOutStep++;
        if (fadeOutStep === TRANSITION_RESOLUTION) clearInterval(fadeOutInterval);
        fadeOutOpacity -= 1 / TRANSITION_RESOLUTION;
        fadeOutDistance -= FADE_IN_DISTANCE / TRANSITION_RESOLUTION;

        currentSection.style.opacity = fadeOutOpacity;
        currentSection.style.bottom = fadeOutDistance + 'rem';
    }, TRANSITION_TIME / TRANSITION_RESOLUTION);
    setTimeout(() => {
        currentSection.style.opacity = 0;
        currentSection.style.bottom = 0;
    }, 1.1 * TRANSITION_TIME);

    // fade in next section
    setTimeout(() => {
        let fadeInStep = 0;
        let fadeInOpacity = 0;
        let fadeInPadding = FADE_OUT_DISTANCE;
        fadeInInterval = setInterval(() => {
            fadeInStep++;
            if (fadeInStep === TRANSITION_RESOLUTION) clearInterval(fadeInInterval);
    
            fadeInOpacity += 1 / TRANSITION_RESOLUTION;
            fadeInPadding -= FADE_OUT_DISTANCE / TRANSITION_RESOLUTION;

            nextSection.style.opacity = fadeInOpacity;
            nextSection.style.bottom = fadeInPadding + 'rem';
        }, TRANSITION_TIME / TRANSITION_RESOLUTION);
        setTimeout(() => {
            nextSection.style.opacity = 1;
            nextSection.style.bottom = 0;
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
        if (fadeOutStep === TRANSITION_RESOLUTION) clearInterval(fadeOutInterval);
        fadeOutOpacity -= 1.5 / TRANSITION_RESOLUTION;
        fadeOutDistance += FADE_IN_DISTANCE / TRANSITION_RESOLUTION;

        currentSection.style.opacity = fadeOutOpacity;
        currentSection.style.bottom = fadeOutDistance + 'rem';
    }, TRANSITION_TIME / TRANSITION_RESOLUTION);
    setTimeout(() => {
        currentSection.style.opacity = 0;
        currentSection.style.bottom = 0;
    }, 1.1 * TRANSITION_TIME);

    // fade in next section
    setTimeout(() => {
        let fadeInStep = 0;
        let fadeInOpacity = 0;
        let fadeInDistance = -FADE_OUT_DISTANCE;
        fadeInInterval = setInterval(() => {
            fadeInStep++;
            if (fadeInStep === TRANSITION_RESOLUTION) clearInterval(fadeInInterval);
    
            fadeInOpacity += 1 / TRANSITION_RESOLUTION;
            fadeInDistance += FADE_OUT_DISTANCE / TRANSITION_RESOLUTION;

            nextSection.style.opacity = fadeInOpacity;
            nextSection.style.bottom = fadeInDistance + 'rem';
        }, TRANSITION_TIME / TRANSITION_RESOLUTION);
        setTimeout(() => {
            nextSection.style.opacity = 1;
            nextSection.style.bottom = 0;
        }, 1.1 * TRANSITION_TIME);
    }, 1.1 * TRANSITION_TIME);
}


const setup = () => {
    sections = document.getElementsByClassName('section');

    resetState();

    currentSection = sections[currentSectionIndex];
    currentSection.style.opacity = 1;
};


const handleScroll = async (event) => {
    if (!canScroll) return;
    canScroll = false;

    if ([' ', 'Space', 'ArrowDown', 'ArrowRight'].indexOf(event.key) > -1 && currentSectionIndex < sections.length - 1) {
        let nextSection = sections[currentSectionIndex + 1];
        
        scrollDown(currentSection, nextSection);
        currentSectionIndex += 1;
        currentSection = nextSection;
    }
    if (['ArrowUp', 'ArrowLeft'].indexOf(event.key) > -1 && currentSectionIndex > 0) {
        let nextSection = sections[currentSectionIndex - 1];
        
        scrollUp(currentSection, nextSection);
        currentSectionIndex -= 1;
        currentSection = nextSection;
    }
};


const resetScroll = () => {
    canScroll = true;
};


window.addEventListener('keydown', (e) => {
    if([' ', 'Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].indexOf(e.code) > -1) {
        e.preventDefault();
    }
}, false);


window.addEventListener('load', setup);
window.addEventListener('keydown', handleScroll);
window.addEventListener('keyup', resetScroll);
