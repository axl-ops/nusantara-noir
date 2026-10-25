/* =========================================
   NUSANTARA NOIR
   THE SOUL OF YOGYAKARTA
   Website Interaction & Behaviour
========================================= */

"use strict";

/* =========================================
   01. CONFIGURATION
========================================= */

const CONFIG = {
    slideDuration: 6000,
    slideTransitionDuration: 180,
    mobileBreakpoint: 992,
    visitorStorageKey: "nusantaraNoirVisitCount"
};


/* =========================================
   02. SLIDER DATA
========================================= */

const slides = [
    {
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Candi%20Prambanan%20di%20Yogyakarta.jpg",
        title: "The Grandeur of Prambanan",
        description: "Discover the magnificent temple heritage of Java."
    },
    {
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Kraton%20Yogyakarta.jpg",
        title: "The Royal Heritage",
        description: "Explore the cultural legacy of Yogyakarta."
    },
    {
        image: "https://commons.wikimedia.org/wiki/Special:FilePath/Malioboro%20Street%2C%20Yogyakarta.JPG",
        title: "The Spirit of Malioboro",
        description: "Experience the heart of Yogyakarta city."
    }
];


/* =========================================
   03. SHARED HELPERS
========================================= */

const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
);

function getElement(selector) {
    return document.querySelector(selector);
}

function getElementById(id) {
    return document.getElementById(id);
}

function supportsIntersectionObserver() {
    return "IntersectionObserver" in window;
}


/* =========================================
   04. LUXURY IMAGE SLIDER
========================================= */

const slider = getElement(".luxury-slider");
const sliderImage = getElementById("sliderImage");
const sliderTitle = getElementById("sliderTitle");
const sliderDescription = getElementById("sliderDescription");
const slideNumber = getElementById("slideNumber");
const sliderProgress = getElementById("sliderProgress");

const previousButton = getElementById("prev");
const nextButton = getElementById("next");

let currentSlide = 0;
let sliderTimer = null;
let slideTransitionTimer = null;
let slideChangeToken = 0;

let sliderHovered = false;
let sliderFocused = false;
let sliderManuallyPaused = false;

const sliderAvailable = Boolean(
    slider &&
    sliderImage &&
    sliderTitle &&
    slides.length > 0
);


/* PRELOAD SLIDER IMAGES */

function preloadSliderImages() {
    slides.forEach(slide => {
        const image = new Image();
        image.src = slide.image;
    });
}


/* UPDATE SLIDER CONTENT */

function showSlide(index) {
    if (!sliderAvailable) {
        return;
    }

    const nextIndex = (
        (index % slides.length) + slides.length
    ) % slides.length;

    currentSlide = nextIndex;

    const slide = slides[currentSlide];
    const changeToken = ++slideChangeToken;

    window.clearTimeout(slideTransitionTimer);

    if (sliderProgress) {
        sliderProgress.style.width = "0%";
    }

    const updateContent = () => {
        if (changeToken !== slideChangeToken) {
            return;
        }

        sliderImage.src = slide.image;
        sliderImage.alt = slide.title;

        sliderTitle.textContent = slide.title;

        if (sliderDescription) {
            sliderDescription.textContent = slide.description;
        }

        if (slideNumber) {
            const number = String(currentSlide + 1).padStart(2, "0");
            const total = String(slides.length).padStart(2, "0");

            slideNumber.textContent = `${number} / ${total}`;
        }

        if (sliderProgress) {
            sliderProgress.style.width =
                `${((currentSlide + 1) / slides.length) * 100}%`;
        }

        sliderImage.style.opacity = "1";
    };

    if (prefersReducedMotion.matches) {
        updateContent();
        return;
    }

    sliderImage.style.opacity = "0.25";

    slideTransitionTimer = window.setTimeout(
        updateContent,
        CONFIG.slideTransitionDuration
    );
}


/* MOVE TO THE PREVIOUS SLIDE */

function showPreviousSlide() {
    showSlide(currentSlide - 1);
    restartSlider();
}


/* MOVE TO THE NEXT SLIDE */

function showNextSlide() {
    showSlide(currentSlide + 1);
    restartSlider();
}


/* STOP AUTOMATIC PLAYBACK */

function stopSlider() {
    if (sliderTimer !== null) {
        window.clearInterval(sliderTimer);
        sliderTimer = null;
    }
}


/* CHECK WHETHER AUTOMATIC PLAYBACK IS ALLOWED */

function canPlaySliderAutomatically() {
    return (
        sliderAvailable &&
        !document.hidden &&
        !sliderHovered &&
        !sliderFocused &&
        !sliderManuallyPaused &&
        !prefersReducedMotion.matches
    );
}


/* START AUTOMATIC PLAYBACK */

function startSlider() {
    stopSlider();

    if (!canPlaySliderAutomatically()) {
        return;
    }

    sliderTimer = window.setInterval(() => {
        showSlide(currentSlide + 1);
    }, CONFIG.slideDuration);
}


/* RESTART TIMER AFTER USER INTERACTION */

function restartSlider() {
    startSlider();
}


/* SLIDER BUTTON EVENTS */

if (previousButton && sliderAvailable) {
    previousButton.addEventListener("click", showPreviousSlide);
}

if (nextButton && sliderAvailable) {
    nextButton.addEventListener("click", showNextSlide);
}


/* PAUSE WHEN THE POINTER ENTERS THE SLIDER */

if (slider) {
    slider.addEventListener("mouseenter", () => {
        sliderHovered = true;
        stopSlider();
    });

    slider.addEventListener("mouseleave", () => {
        sliderHovered = false;
        startSlider();
    });

    slider.addEventListener("focusin", () => {
        sliderFocused = true;
        stopSlider();
    });

    slider.addEventListener("focusout", event => {
        if (!slider.contains(event.relatedTarget)) {
            sliderFocused = false;
            startSlider();
        }
    });
}


/* PAUSE WHEN THE BROWSER TAB IS HIDDEN */

document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
        stopSlider();
    } else {
        startSlider();
    }
});


/* RESPECT REDUCED-MOTION PREFERENCE */

if (typeof prefersReducedMotion.addEventListener === "function") {
    prefersReducedMotion.addEventListener("change", () => {
        if (prefersReducedMotion.matches) {
            stopSlider();
            window.clearTimeout(slideTransitionTimer);

            if (sliderImage) {
                sliderImage.style.opacity = "1";
            }
        } else {
            startSlider();
        }
    });
}


/* INITIALISE SLIDER */

if (sliderAvailable) {
    showSlide(0);
    preloadSliderImages();
    startSlider();
}


/* =========================================
   05. VISITOR COUNTER
========================================= */

/*
   Demonstration counter only.

   This stores the number of visits in the current
   browser. It is not a global website visitor count.

   A server-side database is required for a shared
   visitor counter across different users.
*/

const visitorElement = getElementById("visitorCount");

function initialiseVisitorCounter() {
    if (!visitorElement) {
        return;
    }

    try {
        const storedValue = window.localStorage.getItem(
            CONFIG.visitorStorageKey
        );

        let visitCount = Number(storedValue);

        if (
            storedValue === null ||
            !Number.isSafeInteger(visitCount) ||
            visitCount < 0
        ) {
            visitCount = 0;
        }

        visitCount += 1;

        window.localStorage.setItem(
            CONFIG.visitorStorageKey,
            String(visitCount)
        );

        visitorElement.textContent =
            visitCount.toLocaleString("id-ID");

    } catch (error) {
        /*
           Storage may be blocked by browser privacy
           settings or the current browsing context.
        */

        visitorElement.textContent = "—";

        console.warn(
            "Nusantara Noir: visitor counter storage is unavailable.",
            error
        );
    }
}

initialiseVisitorCounter();


/* =========================================
   06. AUTOMATIC FOOTER YEAR
========================================= */

const yearElement = getElementById("currentYear");

if (yearElement) {
    yearElement.textContent = String(
        new Date().getFullYear()
    );
}


/* =========================================
   07. MOBILE NAVIGATION
========================================= */

const menuElement = getElementById("mainMenu");

function closeMobileMenu() {
    if (
        !menuElement ||
        !window.bootstrap ||
        window.innerWidth >= CONFIG.mobileBreakpoint ||
        !menuElement.classList.contains("show")
    ) {
        return;
    }

    const collapseInstance =
        window.bootstrap.Collapse.getOrCreateInstance(
            menuElement,
            { toggle: false }
        );

    collapseInstance.hide();
}

if (menuElement) {
    menuElement
        .querySelectorAll(".nav-link, .nav-cta")
        .forEach(link => {
            link.addEventListener("click", () => {
                closeMobileMenu();
            });
        });
}


/* =========================================
   08. ACTIVE NAVIGATION STATE
========================================= */

const navigationLinks = document.querySelectorAll(
    '.navbar .nav-link[href^="#"]'
);

function setActiveNavigation(targetId) {
    navigationLinks.forEach(link => {
        const isActive =
            link.getAttribute("href") === `#${targetId}`;

        link.classList.toggle("active", isActive);

        if (isActive) {
            link.setAttribute("aria-current", "location");
        } else {
            link.removeAttribute("aria-current");
        }
    });
}


/* UPDATE ACTIVE LINK WHEN CLICKED */

navigationLinks.forEach(link => {
    link.addEventListener("click", () => {
        const targetId = link.getAttribute("href").slice(1);

        if (getElementById(targetId)) {
            setActiveNavigation(targetId);
        }
    });
});


/* UPDATE ACTIVE LINK WHILE SCROLLING */

const observedSections = Array.from(navigationLinks)
    .map(link => {
        const targetId = link.getAttribute("href").slice(1);
        const section = getElementById(targetId);

        return section ? { targetId, section } : null;
    })
    .filter(Boolean);

if (supportsIntersectionObserver() && observedSections.length) {
    const sectionObserver = new IntersectionObserver(
        entries => {
            const visibleSections = entries
                .filter(entry => entry.isIntersecting)
                .sort(
                    (a, b) =>
                        b.intersectionRatio - a.intersectionRatio
                );

            if (visibleSections.length) {
                const activeSection = observedSections.find(
                    item => item.section === visibleSections[0].target
                );

                if (activeSection) {
                    setActiveNavigation(activeSection.targetId);
                }
            }
        },
        {
            root: null,
            rootMargin: "-20% 0px -55% 0px",
            threshold: [0, 0.1, 0.25, 0.5, 0.75]
        }
    );

    observedSections.forEach(item => {
        sectionObserver.observe(item.section);
    });
}


/* =========================================
   09. BACK-TO-TOP
========================================= */

const backToTop = getElement(".back-top");

if (backToTop) {
    backToTop.addEventListener("click", event => {
        const href = backToTop.getAttribute("href");

        if (href && href !== "#") {
            return;
        }

        event.preventDefault();

        window.scrollTo({
            top: 0,
            behavior: prefersReducedMotion.matches
                ? "auto"
                : "smooth"
        });
    });
}


/* =========================================
   10. EXTERNAL LINKS
========================================= */

/*
   External destination links are left untouched.
   Keep target="_blank" and rel="noopener noreferrer"
   in the HTML wherever a new tab is intended.
*/


/* =========================================
   11. INITIALISATION
========================================= */

document.documentElement.classList.add("js-enabled");

console.info(
    "Nusantara Noir — website interactions initialised."
);