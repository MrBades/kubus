document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('copy-right').textContent = new Date().getFullYear();
    const root = document.documentElement;
    const body = document.body;

    // --- Reworked Mobile Navigation Toggle ---
    const navToggle = document.querySelector('.nav-toggle');
    const menuOverlay = document.querySelector('.menu-overlay');
    const navMenuLinks = document.querySelectorAll('.main-nav .nav-links a');
    const toggleNav = () => body.classList.toggle('nav-active');
    navToggle.addEventListener('click', (e) => { e.stopPropagation(); toggleNav(); });
    menuOverlay.addEventListener('click', () => { if (body.classList.contains('nav-active')) toggleNav(); });
    navMenuLinks.forEach(link => {
        // Exclude the controls container from closing the nav
        if (!link.closest('.nav-controls-container')) {
            link.addEventListener('click', () => { if (body.classList.contains('nav-active')) setTimeout(toggleNav, 150); });
        }
    });
    
    // --- Smooth Scrolling for All Anchor Links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#contact-trigger') {
                e.preventDefault();
                document.getElementById('contact-modal').classList.add('active');
                body.style.overflow = 'hidden';
                return;
            }
            if (targetId === '#' || !document.querySelector(targetId)) return;
            e.preventDefault();
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                const headerOffset = document.querySelector('.main-header').offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        });
    });
    
    // ==========================================================
    //    NEW & REWORKED THEME AND COLOR PICKER LOGIC
    // ==========================================================
    const themeToggle = document.getElementById('theme-toggle');
    const accentColorPicker = document.getElementById('accent-color-picker');
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)');

    // --- Accent Color Functions ---
    const hexToRgb = (hex) => {
        let r = 0, g = 0, b = 0;
        if (hex.length == 4) {
            r = "0x" + hex[1] + hex[1]; g = "0x" + hex[2] + hex[2]; b = "0x" + hex[3] + hex[3];
        } else if (hex.length == 7) {
            r = "0x" + hex[1] + hex[2]; g = "0x" + hex[3] + hex[4]; b = "0x" + hex[5] + hex[6];
        }
        return { r: +r, g: +g, b: +b };
    };

    const getContrastYIQ = (hexcolor) => {
        const { r, g, b } = hexToRgb(hexcolor);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#222222' : '#FFFFFF';
    };

    const applyAccentColor = (color) => {
        if (!color) return;
        const { r, g, b } = hexToRgb(color);
        const contrastColor = getContrastYIQ(color);
        
        root.style.setProperty('--accent-color', color);
        root.style.setProperty('--accent-glow-color', `rgba(${r}, ${g}, ${b}, 0.4)`);
        root.style.setProperty('--accent-text-color', contrastColor);
        
        accentColorPicker.value = color;
        localStorage.setItem('userAccentColor', color);
    };

    // --- Theme (Dark/Light Mode) Function ---
    const applyTheme = (theme) => {
        if (theme === 'light') {
            body.classList.add('light-mode');
        } else {
            body.classList.remove('light-mode');
        }
        localStorage.setItem('theme', theme);

        setTimeout(() => {
            // This part was for particles.js. Since we are removing particles.js,
            // this block can also be removed if particles.js is not used elsewhere.
            if (window.pJSDom && window.pJSDom[0]) {
                const particles = window.pJSDom[0].pJS.particles;
                const newColor = getComputedStyle(body).getPropertyValue('--text-color').trim();
                particles.color.value = newColor;
                particles.line_linked.color = newColor;
                window.pJSDom[0].pJS.fn.particlesRefresh();
            }
        }, 0);
    };
    
    // --- Event Listeners ---
    themeToggle.addEventListener('click', () => {
        const newTheme = body.classList.contains('light-mode') ? 'dark' : 'light';
        applyTheme(newTheme);
    });

    accentColorPicker.addEventListener('input', (e) => {
        applyAccentColor(e.target.value);
    });

    prefersDarkMode.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            applyTheme(e.matches ? 'dark' : 'light');
        }
    });

    // --- Initial Load ---
    const loadUserPreferences = () => {
        const savedTheme = localStorage.getItem('theme') || (prefersDarkMode.matches ? 'dark' : 'light');
        const savedAccentColor = localStorage.getItem('userAccentColor') || '#007BFF';
        
        applyTheme(savedTheme);
        applyAccentColor(savedAccentColor);
    };

    loadUserPreferences();

    // ==========================================================Add commentMore actions
    //    Image Slider Animation (With Loading Screen)
    // ==========================================================
    const loadingScreen = document.querySelector('.loading-screen'); // Re-added
    const loadingText = document.querySelector('.loading-screen p');   // Re-added
    const imageContainer = document.querySelector('.image-container');

    const imageCount = 33;
    const imageBaseName = 'pic';
    const imageExtension = 'jpg';
    const imageFolderPath = 'img/hero/';

    const promises = [];
    let loadedCount = 0; // Re-added

    for (let i = 1; i <= imageCount; i++) {
        const img = new Image();
        const promise = new Promise((resolve, reject) => {
            img.onload = () => {
                loadedCount++; // Update loaded count
                loadingText.textContent = `Loading Assets (${Math.round((loadedCount / imageCount) * 100)}%)`; // Update text
                resolve(img);
            };
            img.onerror = reject;
        });
        img.src = `${imageFolderPath}${imageBaseName}(${i}).${imageExtension}`;
        promises.push(promise);
        img.classList.add('scroll-image');
        imageContainer.appendChild(img);
    }

    Promise.all(promises)
        .then(loadedImages => {
            // Check if GSAP is available before calling startAnimation
            if (typeof gsap !== 'undefined') {
                startAnimation(loadedImages);
            } else {
                console.error("GSAP library is not defined. Animation cannot start.");
                loadingText.textContent = "Error: Animation library not loaded.";
                // Optionally, hide loading screen even if GSAP fails, after a short delay
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 2000);
            }
        })
        .catch(error => {
            console.error("Error loading one or more images.", error);
            loadingText.textContent = "Error loading images. Please check console."; // Display error
        });

    function startAnimation(allImages) {
        gsap.to(loadingScreen, { // Fade out loading screen
            opacity: 0,
            duration: 0.5,
            onComplete: () => loadingScreen.style.display = 'none'
        });

        const masterTimeline = gsap.timeline({
            delay: 0.5, // Delay added to allow loading screen to fade out
            repeat: -1,
            repeatDelay: 1.5
        });

        allImages.forEach((image) => {
            const getStartPosition = () => {
                const side = Math.floor(Math.random() * 4);
                const distance = window.innerWidth * 0.7;
                switch (side) {
                    case 0: return { x: -distance, y: 0 };
                    case 1: return { x: distance, y: 0 };
                    case 2: return { y: -distance, x: 0 };
                    case 3: return { y: distance, x: 0 };
                }
            };

            masterTimeline
                .fromTo(image,
                    {
                        ...getStartPosition(),
                        rotation: (Math.random() - 0.5) * 45,
                        scale: 0.8,
                        opacity: 0,
                    },
                    {
                        x: 0, y: 0, rotation: 0, scale: 1, opacity: 1,
                        duration: 0.7,
                        ease: "power2.out"
                    }
                )
                .to(image, {
                    scale: 1.15,
                    rotation: (Math.random() - 0.5) * 10,
                    duration: 1.5,
                    ease: "sine.inOut", yoyo: true, repeat: 1
                }, ">-0.2")
                .to(image, {
                    opacity: 0, scale: 0.8,
                    duration: 0.5,
                    ease: "power2.in"
                }, ">-0.4");
        });
    }
});
