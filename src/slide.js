/**
 * Config
 */
 const FADE_OUT_TIME = 1.5;
 const FADE_IN_DELAY = 1;
 const FADE_IN_TIME = 1.5;
 const FADE_IN_DISTANCE = 1200;
 const FADE_OUT_DISTANCE = 1200;
 const FADE_OUT_RES = FADE_OUT_TIME / 4;
 const FADE_IN_RES = FADE_IN_TIME / 4;
 
 const SCROLL_LOCK = 100;
 
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
        sections[ind].style.transform = `translateY(0px)`;
    }
 };
 
 
 const resetScroll = () => {
     setTimeout(() => { canScroll = true; console.log('can scroll') }, SCROLL_LOCK);
 };
 
 
 /**
  * Scroll animation
  */
 const scrollDown = async (currentSection, nextSection) => {
     
    // fade out current section
    currentSection.style.opacity = 1;
    currentSection.style.transition = `${FADE_OUT_TIME}s cubic-bezier(.76,.23,1,.63)`;
    currentSection.style.opacity = 0;
    currentSection.style.transform = `translateY(${-FADE_OUT_DISTANCE}px)`;
    
    // fade in next section
    nextSection.style.transition = `0s linear`;
    nextSection.style.transform = `translateY(${FADE_IN_DISTANCE}px)`;
    setTimeout(() => {
        nextSection.style.transition = `${FADE_IN_TIME}s cubic-bezier(.45,.25,.31,.95)`;
        nextSection.style.opacity = 1;
        nextSection.style.transform = `translateY(0px)`;
    }, 1000 * FADE_IN_DELAY);
 };
 
 
const scrollUp = async (currentSection, nextSection) => {

    // fade out current section
    currentSection.style.opacity = 1;
    currentSection.style.transform = `translateY(0px)`;
    setTimeout(() => {
        currentSection.style.transition = `${FADE_OUT_TIME}s cubic-bezier(.76,.23,1,.63)`;
        currentSection.style.opacity = 0;
        currentSection.style.transform = `translateY(${FADE_OUT_DISTANCE}px)`;
    }, 0);
    
    // fade in next section
    nextSection.style.transition = `0s linear`;
    nextSection.style.transform = `translateY(${-FADE_IN_DISTANCE}px)`;
    setTimeout(() => {
        nextSection.style.transition = `${FADE_IN_TIME}s cubic-bezier(.45,.25,.31,.95)`;
        nextSection.style.opacity = 1;
        nextSection.style.transform = `translateY(0px)`;
    }, 1000 * FADE_IN_DELAY);
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
 