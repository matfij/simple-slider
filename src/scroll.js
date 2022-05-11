const VANISH_TIME = 500;
const VANISH_STEPS = 100;
const VANISH_SLIDE = 20;

var currentSection = null;
var currentSectionIndex = 1;
var sections = [];
var fillerSections = [];
var canScroll = true;


const resetStyles = () => {
    for (let ind = 0; ind < sections.length; ind++) {
        sections[ind].style.opacity = 1;
        sections[ind].style.padding = 0;
    }
}


const scrollDown = async (prevElement, element, nextElement) => {
    resetStyles();
    
    if (!prevElement) {
        nextElement.scrollIntoView({behavior: 'auto'});
        element.scrollIntoView({behavior: 'smooth'});
        return;
    }
    prevElement.style.opacity = 1;

    let step = 0;
    let opacity = 1;
    let margin = 0
    let interval = setInterval(() => {
        step += 1;
        if (opacity <= 0) {
            clearInterval(interval);
            return;
        }
        prevElement.style.opacity = opacity;
        prevElement.style.paddingTop = margin + 'rem';
        opacity -= 1.5 / VANISH_STEPS;
        margin += VANISH_SLIDE / VANISH_STEPS;
    }, VANISH_TIME / VANISH_STEPS);

    setTimeout(() => {
        nextElement.scrollIntoView({behavior: 'auto'});
        element.scrollIntoView({behavior: 'smooth'});
        resetStyles();
    }, 0.75 * VANISH_TIME);
};


const scrollUp = async (prevElement, element, nextElement) => {
    resetStyles();

    let step = 0;
    let opacity = 1;
    let margin = 0
    let interval = setInterval(() => {
        step += 1;
        if (opacity <= 0) {
            clearInterval(interval);
            return;
        }
        nextElement.style.opacity = opacity;
        nextElement.style.paddingBottom = margin + 'rem';
        opacity -= 1.5 / VANISH_STEPS;
        margin += VANISH_SLIDE / VANISH_STEPS;
    }, VANISH_TIME / VANISH_STEPS);

    setTimeout(() => {
        prevElement.scrollIntoView({behavior: 'auto'});
        element.scrollIntoView({behavior: 'smooth'});
        resetStyles();
    }, 0.75 * VANISH_TIME);
}


const setup = () => {
    sections = document.getElementsByClassName('section');
    currentSection = sections[currentSectionIndex];
    nextSection = sections[currentSectionIndex + 1];

    fillerSections = document.getElementsByClassName('filler-section');
    
    scrollDown(null, currentSection, nextSection);
    resetStyles();
};


const handleScroll = async (event) => {
    if (!canScroll) return;
    canScroll = false;

    if ([' ', 'Space', 'ArrowDown', 'ArrowRight'].indexOf(event.key) > -1 && currentSectionIndex < sections.length - 2) {
        currentSectionIndex += 2;

        let prevSection = currentSection;
        currentSection = sections[currentSectionIndex];
        let nextSection = sections[currentSectionIndex + 1];
        
        scrollDown(prevSection, currentSection, nextSection);
    }
    if (['ArrowUp', 'ArrowLeft'].indexOf(event.key) > -1 && currentSectionIndex > 1) {
        currentSectionIndex -= 2;
        
        let prevSection = currentSection;
        currentSection = sections[currentSectionIndex];
        let nextSection = sections[currentSectionIndex - 1];
        
        scrollUp(nextSection, currentSection, prevSection);
    }
};


const resetScroll = (event) => {
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
