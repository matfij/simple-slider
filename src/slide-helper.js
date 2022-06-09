const getContentWrapper = (event, contentWrappers) => {
  let contentWrapper = null;

  for (let ind = 0; ind < contentWrappers.length; ind++) {
    const rect = contentWrappers[ind].wrapper.getBoundingClientRect();
    if (rect.top <= 10 && rect.bottom > 1) {
      contentWrapper = contentWrappers[ind];
      break;
    }
  }

  return contentWrapper;
};

const getPresentationWrapper = (event, presentationWrappers) => {
  let presentationWrapper = null;

  for (let ind = 0; ind < presentationWrappers.length; ind++) {
    const rect = presentationWrappers[ind].wrapper.getBoundingClientRect();
    if (rect.top <= 10 && rect.bottom > 1) {
      presentationWrapper = presentationWrappers[ind];
      break;
    }
  }

  return presentationWrapper;
};

const hideSlides = (presentation) => {
  [].forEach.call(presentation.sections, (section, index) => {
    section.style.opacity = 0;
  });
};

const showSlides = (presentation) => {
  [].forEach.call(presentation.sections, (section, index) => {
    section.style.opacity = 1;
  });
};

const throttle = (fn, wait) => {
  var time = Date.now();
  return () => {
    if (time + wait - Date.now() < 0) {
      fn();
      time = Date.now();
    }
  };
}
