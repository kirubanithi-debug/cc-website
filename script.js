/* ========================================
   CLEARCUTS - Interactive JavaScript
   Modern Luxury Creative Agency
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initNavbar();
    initMobileMenu();
    initSmoothScroll();
    initStackedCarousel();
    initStickyCardStack();
    initVideoHover();
    initParallax();
    initScrollAnimations();
    initContactForm();
    initScrollDrivenLogos();
});

/* ========================================
   SCROLL-DRIVEN LOGO ANIMATION
   Logos move only when user scrolls
   ======================================== */
function initScrollDrivenLogos() {
    const logoRows = document.querySelectorAll('.scroll-logo-row');

    if (!logoRows.length) return;

    let lastScrollY = window.scrollY;
    let isInitialized = false;

    // Store data for each row
    const rowData = [];

    function initializeRows() {
        rowData.length = 0;
        logoRows.forEach((row) => {
            const track = row.querySelector('.scroll-logo-track');
            if (!track) return;
            const direction = row.dataset.direction || 'left';
            // Half width = one complete set of logos
            const halfWidth = track.scrollWidth / 2;
            rowData.push({
                track: track,
                direction: direction,
                currentX: 0,
                targetX: 0,
                halfWidth: halfWidth
            });
            // Start at position 0 - logos visible from left
            track.style.transform = `translateX(0px)`;
            track.style.transition = 'transform 0.15s cubic-bezier(0.25, 0.1, 0.25, 1)';
        });
        isInitialized = true;
    }

    // Wait for images to load
    setTimeout(initializeRows, 100);

    function updateLogos() {
        if (!isInitialized) return;

        const currentScrollY = window.scrollY;
        const scrollDelta = currentScrollY - lastScrollY;

        rowData.forEach((data) => {
            // Direction: left = move left when scroll down
            const dirMultiplier = data.direction === 'left' ? 1 : -1;

            // Update target position based on scroll (increased multiplier for more movement)
            data.targetX += scrollDelta * 1.5 * dirMultiplier;

            // Keep within bounds for seamless loop
            if (data.targetX < 0) {
                data.targetX += data.halfWidth;
            } else if (data.targetX >= data.halfWidth) {
                data.targetX = data.targetX % data.halfWidth;
            }

            // Smooth interpolation for buttery movement
            data.currentX += (data.targetX - data.currentX) * 0.12;

            // Apply transform with smooth transition
            data.track.style.transform = `translateX(${-data.currentX}px)`;
        });

        lastScrollY = currentScrollY;
    }

    // Scroll listener
    window.addEventListener('scroll', () => {
        requestAnimationFrame(updateLogos);
    }, { passive: true });
}

/* ========================================
   NAVBAR SCROLL EFFECT
   ======================================== */
function initNavbar() {
    const navbar = document.getElementById('navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Add/remove scrolled class
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

/* ========================================
   MOBILE MENU TOGGLE
   ======================================== */
function initMobileMenu() {
    const toggle = document.getElementById('mobileToggle');
    const navLinks = document.getElementById('navLinks');

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
}

/* ========================================
   SMOOTH SCROLLING - Premium Buttery Smooth
   ======================================== */
function initSmoothScroll() {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Custom easing function - ease-out-expo for premium feel
    function easeOutExpo(t) {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    // Premium smooth scroll function
    function smoothScrollTo(targetPosition, duration = 1200) {
        const startPosition = window.pageYOffset;
        const distance = targetPosition - startPosition;
        let startTime = null;

        function animation(currentTime) {
            if (startTime === null) startTime = currentTime;
            const timeElapsed = currentTime - startTime;
            const progress = Math.min(timeElapsed / duration, 1);
            const easeProgress = easeOutExpo(progress);

            window.scrollTo(0, startPosition + distance * easeProgress);

            if (timeElapsed < duration) {
                requestAnimationFrame(animation);
            }
        }

        requestAnimationFrame(animation);
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);

            if (target) {
                const offsetTop = target.offsetTop - 80;

                // Use native smooth scroll for reduced motion, custom for others
                if (prefersReducedMotion) {
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'auto'
                    });
                } else {
                    smoothScrollTo(offsetTop, 1000);
                }
            }
        });
    });
}

/* ========================================
   STACKED CARD CAROUSEL
   ======================================== */
function initStackedCarousel() {
    const cards = document.querySelectorAll('.stack-card');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const volumeBtn = document.getElementById('volumeBtn');
    const dots = document.querySelectorAll('.dot');

    if (!cards.length) return;

    let currentIndex = 0;
    let isMuted = true;
    const totalCards = cards.length;

    // Update card positions
    function updateCarousel() {
        cards.forEach((card, index) => {
            // Calculate relative position
            let position = index - currentIndex;

            // Handle wrapping for infinite feel
            if (position < -2) position += totalCards;
            if (position > 2) position -= totalCards;

            // Set position attribute
            if (position === -2) {
                card.setAttribute('data-position', 'prev-2');
            } else if (position === -1) {
                card.setAttribute('data-position', 'prev');
            } else if (position === 0) {
                card.setAttribute('data-position', 'active');
            } else if (position === 1) {
                card.setAttribute('data-position', 'next');
            } else if (position === 2) {
                card.setAttribute('data-position', 'next-2');
            } else {
                card.setAttribute('data-position', 'hidden');
            }
        });

        // Update dots
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });

        // Play current video
        playCurrentVideo();
    }

    // Play video of active card
    function playCurrentVideo() {
        cards.forEach((card, index) => {
            const video = card.querySelector('video');
            if (video) {
                if (index === currentIndex) {
                    // Ensure video is ready to play
                    video.muted = isMuted;

                    // Try to play the video
                    const playPromise = video.play();

                    if (playPromise !== undefined) {
                        playPromise.then(() => {
                            // Video started playing
                        }).catch((error) => {
                            console.log('Video autoplay prevented:', error);
                            // Try again after user interaction
                            document.addEventListener('click', function playOnClick() {
                                video.play();
                                document.removeEventListener('click', playOnClick);
                            }, { once: true });
                        });
                    }
                } else {
                    video.pause();
                    video.currentTime = 0;
                }
            }
        });
    }

    // Navigate to next card
    function goNext() {
        currentIndex = (currentIndex + 1) % totalCards;
        updateCarousel();
    }

    // Navigate to previous card
    function goPrev() {
        currentIndex = (currentIndex - 1 + totalCards) % totalCards;
        updateCarousel();
    }

    // Go to specific card
    function goToCard(index) {
        currentIndex = index;
        updateCarousel();
    }

    // Toggle mute/unmute
    function toggleVolume() {
        isMuted = !isMuted;

        const volumeOn = volumeBtn.querySelector('.volume-on');
        const volumeOff = volumeBtn.querySelector('.volume-off');

        if (isMuted) {
            volumeOn.classList.remove('hidden');
            volumeOff.classList.add('hidden');
            volumeBtn.classList.remove('unmuted');
        } else {
            volumeOn.classList.add('hidden');
            volumeOff.classList.remove('hidden');
            volumeBtn.classList.add('unmuted');
        }

        // Update current video mute state
        const activeCard = cards[currentIndex];
        const video = activeCard.querySelector('video');
        if (video) {
            video.muted = isMuted;
        }
    }

    // Event listeners
    if (prevBtn) prevBtn.addEventListener('click', goPrev);
    if (nextBtn) nextBtn.addEventListener('click', goNext);
    if (volumeBtn) volumeBtn.addEventListener('click', toggleVolume);

    // Dot navigation
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => goToCard(index));
    });

    // Card click to navigate
    cards.forEach((card, index) => {
        card.addEventListener('click', () => {
            const position = card.getAttribute('data-position');
            if (position === 'prev' || position === 'prev-2') {
                goPrev();
            } else if (position === 'next' || position === 'next-2') {
                goNext();
            }
        });
    });

    // Swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;
    const cardsStack = document.getElementById('cardsStack');

    if (cardsStack) {
        cardsStack.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        cardsStack.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                goNext(); // Swipe left = next
            } else {
                goPrev(); // Swipe right = prev
            }
        }
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') goPrev();
        if (e.key === 'ArrowRight') goNext();
    });

    // Auto-advance carousel
    let autoplayInterval = setInterval(goNext, 5000);

    // Pause on hover/touch
    const carouselSection = document.querySelector('.reels-carousel');
    if (carouselSection) {
        carouselSection.addEventListener('mouseenter', () => {
            clearInterval(autoplayInterval);
        });

        carouselSection.addEventListener('mouseleave', () => {
            autoplayInterval = setInterval(goNext, 5000);
        });

        carouselSection.addEventListener('touchstart', () => {
            clearInterval(autoplayInterval);
        }, { passive: true });
    }

    // Initialize
    updateCarousel();
}

/* ========================================
   STICKY CARD STACK - Motion Parallax Effect
   Like Flolapo - cards stack with depth parallax
   ======================================== */
function initStickyCardStack() {
    const container = document.querySelector('.cards-container');
    const stickyCards = document.querySelectorAll('.sticky-card');
    if (!stickyCards.length || !container) return;

    // Set z-index so later cards appear on top
    stickyCards.forEach((card, index) => {
        card.style.zIndex = index + 1;
    });

    function updateCards() {
        const containerRect = container.getBoundingClientRect();
        const windowHeight = window.innerHeight;

        stickyCards.forEach((card, index) => {
            const cardInner = card.querySelector('.portfolio-card-inner');
            if (!cardInner) return;

            const rect = card.getBoundingClientRect();

            // How far the card has been scrolled past the sticky point (top: 0)
            // When card is stuck at top and we keep scrolling, its parent moves up
            // We detect this by checking how far into the card's scroll area we are
            const cardOffsetTop = card.offsetTop;
            const scrollProgress = Math.max(0, -containerRect.top - cardOffsetTop + windowHeight);
            const cardScrollRange = windowHeight; // Each card gets one viewport of scroll

            // Normalize progress: 0 = card just became active, 1 = ready to transition to next
            let progress = scrollProgress / cardScrollRange;
            progress = Math.max(0, Math.min(1, progress));

            // Check if this card is the "active" one (stuck at top, being scrolled)
            const isStuck = rect.top <= 0 && rect.bottom > 0;
            const nextCard = stickyCards[index + 1];

            if (isStuck && nextCard) {
                const nextRect = nextCard.getBoundingClientRect();

                // Calculate how much the next card has entered the viewport
                // nextRect.top: starts at windowHeight, goes to 0 as it reaches top
                const nextProgress = Math.max(0, 1 - (nextRect.top / windowHeight));

                // Apply effects based on next card's approach (slower, smoother transitions)
                const scale = 1 - (nextProgress * 0.15); // Scale down to 0.85 for more dramatic effect
                const blur = nextProgress * 8; // Max 8px blur (softer)
                const yOffset = nextProgress * -50; // Move up more for dramatic effect
                const opacity = 1 - (nextProgress * 0.3); // Fade slightly

                cardInner.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1), filter 0.4s ease-out, opacity 0.4s ease-out';
                cardInner.style.transform = `scale(${scale}) translateY(${yOffset}px)`;
                cardInner.style.filter = `blur(${blur}px)`;
                cardInner.style.opacity = opacity;

            } else if (!isStuck && rect.top > 0) {
                // Card hasn't reached sticky point yet - normal state
                cardInner.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.1, 0.25, 1), filter 0.4s ease-out, opacity 0.4s ease-out';
                cardInner.style.transform = 'scale(1) translateY(0)';
                cardInner.style.filter = 'blur(0px)';
                cardInner.style.opacity = '1';

            } else if (rect.bottom <= 0) {
                // Card has scrolled completely out - fully shrunk
                cardInner.style.transform = 'scale(0.85) translateY(-50px)';
                cardInner.style.filter = 'blur(8px)';
                cardInner.style.opacity = '0.7';
            }

            // Video control - play when visible and not blurred
            const video = card.querySelector('video');
            if (video) {
                const currentBlur = parseFloat(cardInner.style.filter.replace(/[^0-9.]/g, '')) || 0;
                if (currentBlur < 3 && video.paused && rect.top < windowHeight && rect.bottom > 0) {
                    video.play().catch(() => { });
                } else if (currentBlur >= 3 && !video.paused) {
                    video.pause();
                }
            }
        });
    }

    // Scroll listener with requestAnimationFrame
    let ticking = false;
    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateCards();
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // Initial update
    updateCards();
}

/* ========================================
   VIDEO HOVER TO PLAY (for portfolio)
   ======================================== */
function initVideoHover() {
    // Portfolio video hover
    document.querySelectorAll('.portfolio-item').forEach(item => {
        const video = item.querySelector('video');
        if (!video) return;

        item.addEventListener('mouseenter', () => {
            video.play().catch(() => { });
        });

        item.addEventListener('mouseleave', () => {
            video.pause();
            video.currentTime = 0;
        });

        // Touch to play on mobile
        item.addEventListener('touchstart', () => {
            if (video.paused) {
                video.play().catch(() => { });
            } else {
                video.pause();
            }
        }, { passive: true });
    });
}

/* ========================================
   PARALLAX EFFECTS
   ======================================== */
function initParallax() {
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    const parallaxBg = document.querySelectorAll('.parallax-bg, .parallax-about');
    const stackItems = document.querySelectorAll('.about-section .stack-item');

    let ticking = false;

    function updateParallax() {
        const scrollY = window.pageYOffset;

        // Floating shapes parallax in hero
        parallaxLayers.forEach(layer => {
            const speed = parseFloat(layer.dataset.speed) || 0.5;
            const y = scrollY * speed;
            layer.style.transform = `translateY(${y}px)`;
        });

        // Background gradient parallax
        parallaxBg.forEach(bg => {
            const speed = parseFloat(bg.dataset.speed) || 0.2;
            const y = scrollY * speed;
            bg.style.transform = `translateY(${y}px)`;
        });

        // About section stacked images parallax
        stackItems.forEach(item => {
            const rect = item.getBoundingClientRect();
            const inView = rect.top < window.innerHeight && rect.bottom > 0;

            if (inView) {
                const speed = parseFloat(item.dataset.parallax) || 0.1;
                const y = (window.innerHeight - rect.top) * speed;
                item.style.transform = `translateY(${-y}px)`;
            }
        });

        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });

    // Initial update
    updateParallax();
}

/* ========================================
   SCROLL REVEAL ANIMATIONS
   ======================================== */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('[data-aos]');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = entry.target.dataset.aosDelay || 0;
                setTimeout(() => {
                    entry.target.classList.add('aos-animate');
                }, delay);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => observer.observe(el));

    // Also animate section headers on scroll
    const sectionHeaders = document.querySelectorAll('.section-header');
    const headerObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.2 });

    sectionHeaders.forEach(header => {
        header.style.opacity = '0';
        header.style.transform = 'translateY(30px)';
        header.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        headerObserver.observe(header);
    });
}

/* ========================================
   CONTACT FORM HANDLING
   ======================================== */
function initContactForm() {
    const form = document.getElementById('contactForm');

    if (!form) return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);

        // Here you would typically send the data to a server
        console.log('Form submitted:', data);

        // Show success message (you can replace this with actual API call)
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;

        btn.innerHTML = '<span>Message Sent! ✓</span>';
        btn.style.background = '#22c55e';

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            form.reset();
        }, 3000);
    });
}

/* ========================================
   LOADING ANIMATION
   ======================================== */
window.addEventListener('load', () => {
    document.body.classList.add('loaded');

    // Trigger initial animations
    setTimeout(() => {
        document.querySelectorAll('.hero-content > *').forEach((el, i) => {
            el.style.animationPlayState = 'running';
        });
    }, 100);
});
