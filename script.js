const reveals = document.querySelectorAll('.reveal');
const transitionOverlay = document.querySelector('.page-transition-overlay') || (() => {
    const overlay = document.createElement('div');
    overlay.className = 'page-transition-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.innerHTML = '<img src="Logo.jpg" alt="Vine Of Truth logo" class="transition-logo" />';
    document.body.prepend(overlay);
    return overlay;
})();

const revealOnScroll = () => {
    reveals.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top;
        const triggerPoint = window.innerHeight * 0.85;

        if (sectionTop < triggerPoint) {
            section.classList.add('reveal-visible');
        }
    });
};

const updateHeroParallax = () => {
    const hero = document.querySelector('.hero-overlay');
    const contactPanel = document.querySelector('.contact-panel');
    const scrollY = window.scrollY;

    if (hero) {
        hero.style.transform = `translateY(${scrollY * 0.05}px)`;
    }

    if (contactPanel) {
        contactPanel.style.transform = `translateY(${scrollY * 0.05}px)`;
    }
};

const initializeGallery = () => {
    const gallery = document.querySelector('.gallery-section');

    if (!gallery) {
        return;
    }

    const imagePaths = gallery.dataset.galleryImages.split('|');
    const viewer = gallery.querySelector('.gallery-viewer');
    const image = gallery.querySelector('.gallery-image');
    const counter = gallery.querySelector('.gallery-counter');
    const previousButton = gallery.querySelector('.gallery-arrow-previous');
    const nextButton = gallery.querySelector('.gallery-arrow-next');
    let currentIndex = 0;
    let touchStartX = 0;

    const showImage = (index) => {
        currentIndex = (index + imagePaths.length) % imagePaths.length;
        image.src = imagePaths[currentIndex];
        image.alt = `Vine Of Truth Landscaping project ${currentIndex + 1} of ${imagePaths.length}`;
        counter.textContent = `${currentIndex + 1} / ${imagePaths.length}`;
    };

    previousButton.addEventListener('click', () => showImage(currentIndex - 1));
    nextButton.addEventListener('click', () => showImage(currentIndex + 1));

    viewer.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowLeft') {
            showImage(currentIndex - 1);
        }

        if (event.key === 'ArrowRight') {
            showImage(currentIndex + 1);
        }
    });

    viewer.addEventListener('pointerdown', (event) => {
        touchStartX = event.clientX;
    });

    viewer.addEventListener('pointerup', (event) => {
        const swipeDistance = event.clientX - touchStartX;

        if (Math.abs(swipeDistance) > 50) {
            showImage(swipeDistance > 0 ? currentIndex - 1 : currentIndex + 1);
        }
    });
};

const getViewportOrigin = (element) => {
    const rect = element.getBoundingClientRect();

    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
    };
};

const setOverlayOrigin = (originX, originY) => {
    transitionOverlay.style.setProperty('--x', `${originX}px`);
    transitionOverlay.style.setProperty('--y', `${originY}px`);
};

const startForwardTransition = (button) => {
    const origin = getViewportOrigin(button);
    setOverlayOrigin(origin.x, origin.y);
    transitionOverlay.style.clipPath = `circle(0% at ${origin.x}px ${origin.y}px)`;

    transitionOverlay.classList.remove('is-collapsing');
    transitionOverlay.classList.add('is-active', 'is-expanding');
    sessionStorage.setItem('playReverseTransition', 'true');

    setTimeout(() => {
        const href = button.getAttribute('href');

        if (href) {
            window.location.href = href;
        }
    }, 700);
};

const startReverseTransition = () => {
    const originX = window.innerWidth / 2;
    const originY = window.innerHeight / 2;
    setOverlayOrigin(originX, originY);

    transitionOverlay.style.clipPath = `circle(150vmax at ${originX}px ${originY}px)`;
    transitionOverlay.style.opacity = '1';
    transitionOverlay.style.visibility = 'visible';

    requestAnimationFrame(() => {
        transitionOverlay.classList.remove('is-expanding');
        transitionOverlay.classList.add('is-active', 'is-collapsing');
    });

    transitionOverlay.addEventListener('animationend', (event) => {
        if (event.animationName !== 'transition-collapse') {
            return;
        }

        transitionOverlay.classList.remove('is-active', 'is-collapsing');
        transitionOverlay.style.clipPath = 'circle(0% at 50% 50%)';
        transitionOverlay.style.opacity = '';
        transitionOverlay.style.visibility = '';
    }, { once: true });
};

const initializeTransitions = () => {
    revealOnScroll();
    updateHeroParallax();
    initializeGallery();

    const quoteButton = document.querySelector('.quote-button');

    if (quoteButton) {
        quoteButton.addEventListener('click', (event) => {
            event.preventDefault();
            startForwardTransition(quoteButton);
        });
    }

    const homeButton = document.querySelector('a[href="index.html"]');

    if (homeButton) {
        homeButton.addEventListener('click', (event) => {
            event.preventDefault();
            startForwardTransition(homeButton);
        });
    }

    const isContactPage = window.location.pathname.includes('contact.html');
    const shouldPlayReverseTransition = isContactPage || sessionStorage.getItem('playReverseTransition') === 'true';

    if (shouldPlayReverseTransition) {
        sessionStorage.removeItem('playReverseTransition');
        startReverseTransition();
    }
};

window.addEventListener('scroll', () => {
    revealOnScroll();
    updateHeroParallax();
});

window.addEventListener('load', () => {
    revealOnScroll();
});

initializeTransitions();
