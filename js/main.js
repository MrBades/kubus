document.addEventListener('DOMContentLoaded', () => {

    document.getElementById('copy-right').textContent = new Date().getFullYear();
    const root = document.documentElement;
    const body = document.body;
    const mainHeader = document.querySelector('.main-header');
    const mainContentSections = document.querySelectorAll('main > .section-padding');
    const navLinksForHighlight = document.querySelectorAll('.main-nav .nav-links a');

    // --- Reworked Mobile Navigation Toggle ---
    const navToggle = document.querySelector('.nav-toggle');
    const menuOverlay = document.querySelector('.menu-overlay');
    const toggleNav = () => body.classList.toggle('nav-active');
    navToggle.addEventListener('click', (e) => { e.stopPropagation(); toggleNav(); });
    menuOverlay.addEventListener('click', () => { if (body.classList.contains('nav-active')) toggleNav(); });
    navLinksForHighlight.forEach(link => {
        if (!link.closest('.nav-controls-container')) {
            link.addEventListener('click', () => { if (body.classList.contains('nav-active')) setTimeout(toggleNav, 150); });
        }
    });
    
    // ==========================================================
    //    NEW: SPA-LIKE SECTION NAVIGATION
    // ==========================================================
    const showMainSection = (targetId) => {
        // Hide all main sections
        mainContentSections.forEach(section => {
            section.classList.remove('active-section');
        });

        // Show the target section if it's not the hero
        if (targetId && targetId !== '#hero') {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.classList.add('active-section');
                // Scroll to the top of the new section
                const headerOffset = mainHeader.offsetHeight;
                const elementPosition = targetElement.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            }
        } else {
            // If it's the hero link, just scroll to the top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const updateActiveNavLink = (targetHref) => {
        navLinksForHighlight.forEach(link => {
            link.classList.remove('active-link');
            if (link.getAttribute('href') === targetHref) {
                link.classList.add('active-link');
            }
        });
    };

    // Attach event listeners to all navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');

            if (targetId === '#contact-trigger' || this.classList.contains('open-contact-modal')) {
                // First, show the contact section
                showMainSection('#contact-trigger');
                // Then, open the contact modal
                document.getElementById('contact-modal').classList.add('active');
                if (!body.classList.contains('detail-view-active')) {
                    body.style.overflow = 'hidden';
                }
                // Update nav link highlighting
                updateActiveNavLink('#contact-trigger');
            } else {
                // Handle all other section navigation
                showMainSection(targetId);
                updateActiveNavLink(targetId);
            }
        });
    });

    
    // ==========================================================
    //    THEME AND COLOR PICKER LOGIC (Unchanged)
    // ==========================================================
    const themeToggle = document.getElementById('theme-toggle');
    const accentColorPicker = document.getElementById('accent-color-picker');
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)');

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

    const applyTheme = (theme) => {
        if (theme === 'light') {
            body.classList.add('light-mode');
        } else {
            body.classList.remove('light-mode');
        }
        localStorage.setItem('theme', theme);

        setTimeout(() => {
            if (window.pJSDom && window.pJSDom[0]) {
                const particles = window.pJSDom[0].pJS.particles;
                const newColor = getComputedStyle(body).getPropertyValue('--text-color').trim();
                particles.color.value = newColor;
                particles.line_linked.color = newColor;
                window.pJSDom[0].pJS.fn.particlesRefresh();
            }
        }, 0);
    };
    
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

    const loadUserPreferences = () => {
        const savedTheme = localStorage.getItem('theme') || (prefersDarkMode.matches ? 'dark' : 'light');
        const savedAccentColor = localStorage.getItem('userAccentColor') || '#007BFF';
        
        applyTheme(savedTheme);
        applyAccentColor(savedAccentColor);
    };

    loadUserPreferences();

    // ==========================================================
    //    REMAINING JAVASCRIPT LOGIC (Unchanged)
    // ==========================================================
    
    // --- Project Detail Modal Logic ---
    const projectCards = document.querySelectorAll('.project-card');
    const projectDetailModal = document.getElementById('project-detail-modal');
    const projectsData = {
        1: { title: "Fudan University IT & E-learning", tagline: "Comprehensive Digital Infrastructure", problem: "Fudan University required a complete overhaul of its digital services to support a modern, hybrid learning environment for thousands of students.", solution: "Kubus Engineering designed and implemented a campus-wide high-speed internet network, integrated a state-of-the-art CCTV security system, and deployed a custom e-learning software platform accessible from any device.", techStack: ["Fiber Optics", "CCTV", "E-learning Software", "Network Security"] },
        2: { title: "Central Washington E-learning", tagline: "Digital E-learning Services", problem: "Central Washington College needed to transition its traditional curriculum to a fully digital format to cater to remote students.", solution: "We developed a bespoke e-learning platform with interactive course modules, live-streaming capabilities, and secure student assessment tools, ensuring a seamless and engaging educational experience.", techStack: ["E-learning", "Cloud Services", "Video Streaming", "LMS"] },
        3: { title: "Central Washington Satellite Internet", tagline: "High-Speed Satellite Internet", problem: "The college's remote research outposts were disconnected from the main campus network, hindering data sharing and collaboration.", solution: "By installing and activating high-speed VSAT satellite terminals at each location, we provided reliable, low-latency internet, enabling real-time data synchronization and remote access to campus resources.", techStack: ["Satellite Internet", "VSAT", "WAN", "QoS"] },
        4: { title: "FMST Data Center & Resource Center", tagline: "Data Center, LAN/WAN, Servers", problem: "The Federal Ministry of Science and Technology (FMST) required a modernized, secure, and scalable data center to manage national scientific data.", solution: "Kubus engineered a Tier III data center, including server deployment, structured LAN/WAN cabling, and robust power backup systems, creating a resilient core for the nation's scientific infrastructure.", techStack: ["Data Center", "LAN/WAN", "Server Admin", "Power Systems"] },
        5: { title: "Nationwide VSAT Deployment", tagline: "VSAT Installation & Activation", problem: "A leading financial institution needed to connect hundreds of remote bank branches across Nigeria to its central network securely and reliably.", solution: "We executed a nationwide VSAT deployment project, installing and activating satellite communication systems at over 200 sites, ensuring 99.99% uptime for critical banking operations.", techStack: ["VSAT", "Satellite Communication", "Project Management"] },
        6: { title: "IHS Africa Grid Connection", tagline: "Power Infrastructure, Grid Connection", problem: "IHS Towers, a major telecom infrastructure provider, needed to reduce operational costs by connecting their off-grid tower sites to the national power grid.", solution: "Our team managed the end-to-end grid connection process for numerous sites, including transformer installation, ATS setup, and power load balancing, resulting in significant opex savings for the client.", techStack: ["Grid Connection", "Power Engineering", "ATS", "Transformers"] }
    };
    projectCards.forEach(card => {
        card.addEventListener('click', () => {
            const projectId = card.dataset.projectId;
            const project = projectsData[projectId];
            if (project) {
                projectDetailModal.querySelector('#modal-project-title').textContent = project.title;
                projectDetailModal.querySelector('#modal-project-tagline').textContent = project.tagline;
                projectDetailModal.querySelector('#modal-project-problem').textContent = project.problem;
                projectDetailModal.querySelector('#modal-project-solution').textContent = project.solution;
                const techStackContainer = projectDetailModal.querySelector('#modal-tech-stack');
                techStackContainer.innerHTML = '';
                project.techStack.forEach(tech => {
                    const span = document.createElement('span');
                    span.classList.add('tech-badge');
                    span.textContent = tech;
                    techStackContainer.appendChild(span);
                });
                projectDetailModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
    });

    // --- Reusable Modal Closing Logic ---
    const allModals = document.querySelectorAll('.modal');
    const closeModalBtns = document.querySelectorAll('.close-modal-btn');
    const closeModal = (modal) => {
        if(modal) {
            modal.classList.remove('active');
            if (!document.querySelector('.modal.active') && !body.classList.contains('detail-view-active')) {
                body.style.overflow = '';
            }
        }
    };
    closeModalBtns.forEach(btn => btn.addEventListener('click', () => closeModal(btn.closest('.modal'))));
    allModals.forEach(modal => modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(modal); }));

    // --- Contact Form Submission ---
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const submitBtn = this.querySelector('button[type="submit"]');
            submitBtn.textContent = 'TRANSMITTING...';
            submitBtn.disabled = true;
            setTimeout(() => {
                alert('Message Sent! Thank you for contacting Kubus Engineer. We will be in touch shortly.');
                closeModal(contactForm.closest('.modal'));
                contactForm.reset();
                submitBtn.textContent = 'SEND CONSULTATION REQUEST';
                submitBtn.disabled = false;
            }, 1500);
        });
    }
    
    // --- Scroll-Triggered Reveal Animations ---
    const revealElements = document.querySelectorAll('.reveal-section, .reveal-item');
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    revealElements.forEach(el => revealObserver.observe(el));
    
    // --- Custom Cursor ---
    const customCursor = document.createElement('div');
    customCursor.classList.add('custom-cursor');
    body.appendChild(customCursor);
    document.addEventListener('mousemove', (e) => {
        customCursor.style.left = `${e.clientX}px`;
        customCursor.style.top = `${e.clientY}px`;
    });
    document.querySelectorAll('a, button, .project-card, .clickable-card, .nav-toggle, .color-picker-label').forEach(el => {
        el.addEventListener('mouseenter', () => customCursor.classList.add('active'));
        el.addEventListener('mouseleave', () => customCursor.classList.remove('active'));
    });

    // --- Image Slider Animation ---
    const loadingScreen = document.querySelector('.loading-screen');
    const loadingText = document.querySelector('.loading-screen p');
    const imageContainer = document.querySelector('.image-container');
    const imageCount = 18;
    const imageBaseName = 'pic';
    const imageExtension = 'jpg';
    const imageFolderPath = 'img/hero/';
    const promises = [];
    let loadedCount = 0;
    for (let i = 1; i <= imageCount; i++) {
        const img = new Image();
        const promise = new Promise((resolve, reject) => {
            img.onload = () => {
                loadedCount++;
                loadingText.textContent = `Loading Assets (${Math.round((loadedCount / imageCount) * 100)}%)`;
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
            if (typeof gsap !== 'undefined') {
                startAnimation(loadedImages);
            } else {
                console.error("GSAP library is not defined.");
                loadingText.textContent = "Error: Animation library not loaded.";
                setTimeout(() => { loadingScreen.style.display = 'none'; }, 2000);
            }
        })
        .catch(error => {
            console.error("Error loading images.", error);
            loadingText.textContent = "Error loading images.";
        });

    function startAnimation(allImages) {
        gsap.to(loadingScreen, { opacity: 0, duration: 0.5, onComplete: () => loadingScreen.style.display = 'none' });
        const masterTimeline = gsap.timeline({ delay: 0.5, repeat: -1, repeatDelay: 1.5 });
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
                .fromTo(image, { ...getStartPosition(), rotation: (Math.random() - 0.5) * 45, scale: 0.8, opacity: 0, }, { x: 0, y: 0, rotation: 0, scale: 1, opacity: 1, duration: 0.7, ease: "power2.out" })
                .to(image, { scale: 1.15, rotation: (Math.random() - 0.5) * 10, duration: 1.5, ease: "sine.inOut", yoyo: true, repeat: 1 }, ">-0.2")
                .to(image, { opacity: 0, scale: 0.8, duration: 0.5, ease: "power2.in" }, ">-0.4");
        });
    }

    // --- Detail View (Profiles & Services) Logic ---
    const detailViewContainer = document.getElementById('detail-view-container');
    const clickableCards = document.querySelectorAll('.clickable-card');
    const backToMainBtn = document.getElementById('back-to-main-btn');
    const allDetailSections = detailViewContainer.querySelectorAll('.detail-section');
    clickableCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.tagName === 'A' || e.target.tagName === 'BUTTON') { return; }
            const targetId = card.dataset.target;
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                detailViewContainer.classList.add('active');
                body.classList.add('detail-view-active');
                allDetailSections.forEach(section => section.classList.remove('visible'));
                targetSection.classList.add('visible');
                detailViewContainer.scrollTop = 0;
            }
        });
    });
    backToMainBtn.addEventListener('click', () => {
        detailViewContainer.classList.remove('active');
        body.classList.remove('detail-view-active');
    });

});
