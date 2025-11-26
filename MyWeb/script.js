// ========================================
// CYBERPUNK PORTFOLIO - JAVASCRIPT
// Version: 1.0.0
// ========================================

'use strict';

// ========================================
// PARTICLE ANIMATION (Entry Section)
// ========================================

class ParticleSystem {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.particleCount = 150;
        this.connectionDistance = 120;

        this.resize();
        this.init();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    init() {
        this.particles = [];
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vx: (Math.random() - 0.5) * 0.5,
                vy: (Math.random() - 0.5) * 0.5,
                radius: Math.random() * 2 + 1
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Update and draw particles
        this.particles.forEach((particle, i) => {
            // Move particle
            particle.x += particle.vx;
            particle.y += particle.vy;

            // Boundary check
            if (particle.x < 0 || particle.x > this.canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > this.canvas.height) particle.vy *= -1;

            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(0, 243, 255, 0.8)';
            this.ctx.fill();

            // Draw connections
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[j].x - particle.x;
                const dy = this.particles[j].y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < this.connectionDistance) {
                    const opacity = (1 - distance / this.connectionDistance) * 0.5;
                    this.ctx.beginPath();
                    this.ctx.moveTo(particle.x, particle.y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.strokeStyle = `rgba(0, 243, 255, ${opacity})`;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        });

        requestAnimationFrame(() => this.animate());
    }
}

// ========================================
// SMOOTH SCROLLING
// ========================================

function initSmoothScroll() {
    const navLinks = document.querySelectorAll('.nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const navHeight = document.querySelector('.nav-bar').offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                const navMenu = document.querySelector('.nav-menu');
                if (navMenu.classList.contains('active')) {
                    navMenu.classList.remove('active');
                }
            }
        });
    });

    // CTA button smooth scroll
    const ctaButton = document.querySelector('.cta-button');
    if (ctaButton) {
        ctaButton.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = ctaButton.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const navHeight = document.querySelector('.nav-bar').offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    }
}

// ========================================
// MOBILE NAVIGATION TOGGLE
// ========================================

function initMobileNav() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

// ========================================
// EXPERIENCE CARDS EXPANSION
// ========================================

function initExperienceCards() {
    const cards = document.querySelectorAll('.experience-card');

    cards.forEach(card => {
        const content = card.querySelector('.card-content');
        const expandBtn = card.querySelector('.card-expand');
        let isExpanded = false;

        // Set initial max-height
        content.style.maxHeight = '150px';
        content.style.overflow = 'hidden';
        content.style.transition = 'max-height 0.3s ease';

        card.addEventListener('click', () => {
            if (!isExpanded) {
                content.style.maxHeight = content.scrollHeight + 'px';
                expandBtn.style.transform = 'rotate(45deg)';
                isExpanded = true;
            } else {
                content.style.maxHeight = '150px';
                expandBtn.style.transform = 'rotate(0deg)';
                isExpanded = false;
            }
        });
    });
}

// ========================================
// SKILL BARS ANIMATION ON SCROLL
// ========================================

function initSkillBarsAnimation() {
    const skillItems = document.querySelectorAll('.skill-item');

    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const progressBar = entry.target.querySelector('.skill-progress');
                const width = progressBar.style.width;

                // Reset and animate
                progressBar.style.width = '0';
                setTimeout(() => {
                    progressBar.style.width = width;
                }, 100);

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    skillItems.forEach(item => observer.observe(item));
}

// ========================================
// TIMELINE ANIMATION ON SCROLL
// ========================================

function initTimelineAnimation() {
    const timelineItems = document.querySelectorAll('.timeline-item');

    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);

                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    timelineItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(item);
    });
}

// ========================================
// 3D TILT EFFECT FOR PHOTO WALL
// ========================================

class TiltEffect {
    constructor(element) {
        this.element = element;
        this.settings = {
            maxTilt: 15,
            perspective: 1000,
            scale: 1.05,
            speed: 400,
            easing: 'cubic-bezier(.03,.98,.52,.99)'
        };

        this.init();
    }

    init() {
        this.element.style.transformStyle = 'preserve-3d';
        this.element.style.transition = `transform ${this.settings.speed}ms ${this.settings.easing}`;

        this.element.addEventListener('mouseenter', () => this.onMouseEnter());
        this.element.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.element.addEventListener('mouseleave', () => this.onMouseLeave());
    }

    onMouseEnter() {
        this.element.style.willChange = 'transform';
    }

    onMouseMove(e) {
        const rect = this.element.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const percentX = (x - centerX) / centerX;
        const percentY = (y - centerY) / centerY;

        const tiltX = percentY * this.settings.maxTilt;
        const tiltY = -percentX * this.settings.maxTilt;

        this.element.style.transform = `
            perspective(${this.settings.perspective}px)
            rotateX(${tiltX}deg)
            rotateY(${tiltY}deg)
            scale3d(${this.settings.scale}, ${this.settings.scale}, ${this.settings.scale})
        `;
    }

    onMouseLeave() {
        this.element.style.willChange = 'auto';
        this.element.style.transform = `
            perspective(${this.settings.perspective}px)
            rotateX(0deg)
            rotateY(0deg)
            scale3d(1, 1, 1)
        `;
    }
}

function initPhotoTilt() {
    const photoItems = document.querySelectorAll('[data-tilt]');
    photoItems.forEach(item => new TiltEffect(item));
}

// ========================================
// PARALLAX EFFECT FOR PHOTO WALL
// ========================================

function initPhotoParallax() {
    const photoWall = document.querySelector('.photo-wall');
    if (!photoWall) return;

    const photoItems = photoWall.querySelectorAll('.photo-item');

    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const gallerySection = document.querySelector('.gallery-section');

        if (!gallerySection) return;

        const galleryTop = gallerySection.offsetTop;
        const galleryHeight = gallerySection.offsetHeight;

        if (scrolled > galleryTop - window.innerHeight && scrolled < galleryTop + galleryHeight) {
            photoItems.forEach((item, index) => {
                const speed = (index % 3 + 1) * 0.05;
                const yPos = (scrolled - galleryTop) * speed;
                item.style.transform = `translateY(${yPos}px)`;
            });
        }
    });
}

// ========================================
// NAVBAR BACKGROUND ON SCROLL
// ========================================

function initNavbarScroll() {
    const navbar = document.querySelector('.nav-bar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            navbar.style.background = 'rgba(10, 10, 15, 0.95)';
            navbar.style.boxShadow = '0 5px 20px rgba(0, 243, 255, 0.2)';
        } else {
            navbar.style.background = 'rgba(10, 10, 15, 0.9)';
            navbar.style.boxShadow = 'none';
        }
    });
}

// ========================================
// SECTION FADE IN ON SCROLL
// ========================================

function initSectionFadeIn() {
    const sections = document.querySelectorAll('.section');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
        observer.observe(section);
    });
}

// ========================================
// CURSOR TRAIL EFFECT (Optional Enhancement)
// ========================================

class CursorTrail {
    constructor() {
        this.coords = [];
        this.maxCoords = 20;

        this.canvas = document.createElement('canvas');
        this.canvas.style.position = 'fixed';
        this.canvas.style.top = '0';
        this.canvas.style.left = '0';
        this.canvas.style.pointerEvents = 'none';
        this.canvas.style.zIndex = '9999';
        document.body.appendChild(this.canvas);

        this.ctx = this.canvas.getContext('2d');
        this.resize();

        window.addEventListener('resize', () => this.resize());
        window.addEventListener('mousemove', (e) => this.addCoord(e));

        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    addCoord(e) {
        this.coords.push({ x: e.clientX, y: e.clientY });
        if (this.coords.length > this.maxCoords) {
            this.coords.shift();
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.coords.forEach((coord, index) => {
            const nextCoord = this.coords[index + 1] || this.coords[index];

            this.ctx.beginPath();
            this.ctx.moveTo(coord.x, coord.y);
            this.ctx.lineTo(nextCoord.x, nextCoord.y);

            const opacity = index / this.coords.length;
            this.ctx.strokeStyle = `rgba(0, 243, 255, ${opacity * 0.3})`;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();

            // Draw dot
            this.ctx.beginPath();
            this.ctx.arc(coord.x, coord.y, 2, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(0, 243, 255, ${opacity * 0.5})`;
            this.ctx.fill();
        });

        requestAnimationFrame(() => this.animate());
    }
}

// ========================================
// GLITCH TEXT EFFECT
// ========================================

function initGlitchEffect() {
    const glitchElements = document.querySelectorAll('.glitch');

    glitchElements.forEach(element => {
        const text = element.getAttribute('data-text');

        setInterval(() => {
            if (Math.random() > 0.95) {
                element.style.textShadow = `
                    ${Math.random() * 10 - 5}px ${Math.random() * 10 - 5}px 0 #ff00ff,
                    ${Math.random() * 10 - 5}px ${Math.random() * 10 - 5}px 0 #00f3ff
                `;

                setTimeout(() => {
                    element.style.textShadow = '0 0 10px #00f3ff, 0 0 20px #00f3ff';
                }, 50);
            }
        }, 100);
    });
}

// ========================================
// TYPING EFFECT FOR ENTRY SUBTITLE
// ========================================

function initTypingEffect() {
    const subtitle = document.querySelector('.entry-subtitle');
    if (!subtitle) return;

    const originalText = subtitle.innerHTML;
    subtitle.innerHTML = '';

    let charIndex = 0;
    const typingSpeed = 50;

    function type() {
        if (charIndex < originalText.length) {
            subtitle.innerHTML += originalText.charAt(charIndex);
            charIndex++;
            setTimeout(type, typingSpeed);
        }
    }

    setTimeout(type, 500);
}

// ========================================
// SCROLL PROGRESS INDICATOR
// ========================================

function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.style.position = 'fixed';
    progressBar.style.top = '0';
    progressBar.style.left = '0';
    progressBar.style.width = '0%';
    progressBar.style.height = '3px';
    progressBar.style.background = 'linear-gradient(90deg, #00f3ff, #ff00ff)';
    progressBar.style.zIndex = '10000';
    progressBar.style.boxShadow = '0 0 10px #00f3ff';
    progressBar.style.transition = 'width 0.1s ease';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.pageYOffset / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// ========================================
// ACTIVE NAVIGATION HIGHLIGHT
// ========================================

function initActiveNav() {
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;

            if (pageYOffset >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.style.color = 'var(--color-gray-200)';
            if (link.getAttribute('href') === `#${current}`) {
                link.style.color = 'var(--color-neon-cyan)';
            }
        });
    });
}

// ========================================
// EASTER EGG: KONAMI CODE
// ========================================

function initKonamiCode() {
    const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let konamiIndex = 0;

    document.addEventListener('keydown', (e) => {
        if (e.key === konamiCode[konamiIndex]) {
            konamiIndex++;

            if (konamiIndex === konamiCode.length) {
                activateMatrixMode();
                konamiIndex = 0;
            }
        } else {
            konamiIndex = 0;
        }
    });
}

function activateMatrixMode() {
    document.body.style.filter = 'hue-rotate(90deg)';

    const message = document.createElement('div');
    message.textContent = 'MATRIX MODE ACTIVATED';
    message.style.position = 'fixed';
    message.style.top = '50%';
    message.style.left = '50%';
    message.style.transform = 'translate(-50%, -50%)';
    message.style.fontSize = '3rem';
    message.style.color = '#00ff00';
    message.style.zIndex = '10000';
    message.style.textShadow = '0 0 20px #00ff00';
    document.body.appendChild(message);

    setTimeout(() => {
        document.body.style.filter = 'none';
        message.remove();
    }, 3000);
}

// ========================================
// DAY PROGRESS TRACKER
// ========================================

function initDayProgress() {
    const progressValue = document.getElementById('day-progress-value');
    const progressFill = document.getElementById('day-progress-fill');

    if (!progressValue || !progressFill) return;

    function updateDayProgress() {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        const totalMilliseconds = endOfDay - startOfDay;
        const elapsedMilliseconds = now - startOfDay;
        const percentage = (elapsedMilliseconds / totalMilliseconds) * 100;

        // Update the display
        progressValue.textContent = percentage.toFixed(1) + '%';
        progressFill.style.width = percentage.toFixed(1) + '%';
    }

    // Update immediately
    updateDayProgress();

    // Update every minute (60000ms)
    setInterval(updateDayProgress, 60000);
}

// ========================================
// INITIALIZATION
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Initialize particle system
    const canvas = document.getElementById('particle-canvas');
    if (canvas) {
        const particleSystem = new ParticleSystem(canvas);
        particleSystem.animate();
    }

    // Initialize all features
    initSmoothScroll();
    initMobileNav();
    initExperienceCards();
    initSkillBarsAnimation();
    initTimelineAnimation();
    initPhotoTilt();
    initPhotoParallax();
    initNavbarScroll();
    initSectionFadeIn();
    initGlitchEffect();
    initTypingEffect();
    initScrollProgress();
    initActiveNav();
    initKonamiCode();
    initDayProgress();

    // Optional: Initialize cursor trail (can be disabled if too much)
    // new CursorTrail();

    console.log('%c SYSTEM INITIALIZED ', 'background: #00f3ff; color: #000; font-size: 20px; font-weight: bold;');
    console.log('%c Welcome to the Cyberpunk Portfolio ', 'background: #ff00ff; color: #000; font-size: 16px;');
});

// ========================================
// PERFORMANCE OPTIMIZATION
// ========================================

// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for high-frequency events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
