$(document).ready(function(){
    // ==========================================
    // Theme Switcher (Dark / Light) with localStorage
    // ==========================================
    const THEME_KEY = 'portfolio-theme';
    
    function getStoredTheme() {
        try {
            const stored = localStorage.getItem(THEME_KEY);
            if (stored === 'light' || stored === 'dark') return stored;
            return (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
        } catch (e) {
            return 'dark';
        }
    }

    function applyTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        if (document.body) {
            document.body.setAttribute('data-theme', theme);
        }
        try {
            localStorage.setItem(THEME_KEY, theme);
        } catch (e) {}

        const isLight = theme === 'light';
        $('#themeToggleBtn').attr('title', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
        $('#themeToggleBtn').attr('aria-label', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
        $('#mobileThemeModeText').text(isLight ? 'Light Mode' : 'Dark Mode');
        $('#mobileThemeToggleBtn .theme-label i').attr('class', isLight ? 'fas fa-sun' : 'fas fa-moon');
    }

    // Sync UI with current theme on document ready
    const activeTheme = $('html').attr('data-theme') || getStoredTheme();
    applyTheme(activeTheme);

    // Toggle button click handlers (desktop + mobile)
    $('#themeToggleBtn, #mobileThemeToggleBtn').on('click', function(e) {
        e.preventDefault();
        const currentTheme = $('html').attr('data-theme') === 'light' ? 'light' : 'dark';
        const nextTheme = currentTheme === 'light' ? 'dark' : 'light';
        applyTheme(nextTheme);
    });

    // Listen to OS theme changes if user hasn't chosen manually
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function(e) {
            try {
                if (!localStorage.getItem(THEME_KEY)) {
                    applyTheme(e.matches ? 'light' : 'dark');
                }
            } catch (err) {}
        });
    }

    // ==========================================
    // Precision Scroll-Spy & Navbar State Engine
    // ==========================================
    const $sections = $('section[id]');
    const $navLinks = $('.navbar .menu li a[href^="#"]');
    let activeSectionId = null;
    let isScrollTicking = false;

    function getNavHeight() {
        return $('.navbar').outerHeight() || 75;
    }

    function updateScrollSpy() {
        if (!$sections.length) return;

        const scrollY = $(window).scrollTop();
        const windowHeight = $(window).height();
        const docHeight = $(document).height();
        const navHeight = getNavHeight();

        // 1. Bottom of page override: always highlight contact when scrolled to end
        if (scrollY + windowHeight >= docHeight - 60) {
            setActiveLink('contact');
            return;
        }

        // 2. Determine currently viewed section
        // Threshold is just below the sticky navbar plus a comfortable viewing offset
        const viewThreshold = scrollY + navHeight + 80;
        let currentId = $sections.first().attr('id') || 'home';

        $sections.each(function() {
            const sectionTop = $(this).offset().top;
            if (viewThreshold >= sectionTop) {
                currentId = $(this).attr('id');
            }
        });

        setActiveLink(currentId);
    }

    function setActiveLink(sectionId) {
        if (activeSectionId === sectionId) return;
        activeSectionId = sectionId;

        $navLinks.removeClass('active');
        const $targetLink = $(`.navbar .menu li a[href="#${sectionId}"]`);
        if ($targetLink.length) {
            $targetLink.addClass('active');
        }
    }

    // Scroll event listener with requestAnimationFrame throttling for 60fps
    $(window).on('scroll', function() {
        const scrollY = window.scrollY || $(window).scrollTop();

        // Reading progress bar calculation
        const docHeight = $(document).height();
        const winHeight = $(window).height();
        const progress = Math.min(100, Math.max(0, (scrollY / (docHeight - winHeight)) * 100));
        const progressBar = document.getElementById('scrollProgressBar');
        if (progressBar) {
            progressBar.style.width = progress.toFixed(1) + '%';
        }

        // Sticky navbar toggle
        if (scrollY > 20) {
            $('.navbar').addClass("sticky");
        } else {
            $('.navbar').removeClass("sticky");
        }
        
        // Scroll-up button toggle
        if (scrollY > 400) {
            $('.scroll-up-btn').addClass("show");
        } else {
            $('.scroll-up-btn').removeClass("show");
        }

        // Scroll spy update
        if (!isScrollTicking) {
            isScrollTicking = true;
            requestAnimationFrame(() => {
                updateScrollSpy();
                isScrollTicking = false;
            });
        }
    });

    // Update on window resize (layout recalculations)
    $(window).on('resize', function() {
        updateScrollSpy();
    });

    // Run immediately on page load
    updateScrollSpy();
    
    // Scroll up click
    $('.scroll-up-btn').on('click', function(){
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Mobile menu toggle
    $('.menu-btn').on('click', function(){
        $('.navbar .menu').toggleClass("active");
        $('.menu-btn i').toggleClass("fa-times fa-bars");
    });

    // Smooth navigation anchor scrolling
    $('.navbar .menu li a[href^="#"], .navbar .logo a, .hero-actions a[href^="#"]').on('click', function(e) {
        const targetHref = $(this).attr('href');
        if (targetHref && targetHref.startsWith('#') && targetHref.length > 1) {
            const $targetSection = $(targetHref);
            if ($targetSection.length) {
                e.preventDefault();
                const navHeight = getNavHeight();
                const targetTop = $targetSection.offset().top - navHeight + 2;

                window.scrollTo({
                    top: targetTop,
                    behavior: 'smooth'
                });

                // Immediately update active link for instant UI responsiveness
                const sectionId = targetHref.replace('#', '');
                setActiveLink(sectionId);

                // Close mobile menu if open
                $('.navbar .menu').removeClass("active");
                $('.menu-btn i').removeClass("fa-times").addClass("fa-bars");
            }
        }
    });

    // Contact Form handling with toast notification
    $('#contactForm').on('submit', function(e){
        e.preventDefault();
        
        const name = $('#name').val().trim();
        const email = $('#email').val().trim();
        const subject = $('#subject').val().trim();
        const message = $('#message').val().trim();

        if(!name || !email || !message) {
            showToast('Please fill out all required fields.');
            return;
        }

        // Display success toast
        showToast(`Thank you, ${name}! Your message has been prepared.`);
        
        // Optional mailto trigger
        const mailtoUri = `mailto:vtalluri915@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent("From: " + name + " (" + email + ")\n\n" + message)}`;
        
        // Reset form after short delay
        setTimeout(function(){
            $('#contactForm')[0].reset();
            window.location.href = mailtoUri;
        }, 1200);
    });

    function showToast(msg) {
        $('#toastText').text(msg);
        $('#toast').addClass('show');
        setTimeout(function(){
            $('#toast').removeClass('show');
        }, 4000);
    }

    // Typing effect for Hero Section role
    const typingPhrases = [
        "Technical Analyst – Cybersecurity & IT Operations",
        "Cybersecurity Operations & SIEM Specialist",
        "Endpoint Security & Patch Management",
        "Vulnerability Assessment & VAPT",
        "Decentralized Network & Cloud Security"
    ];

    let phraseIdx = 0;
    let charIdx = typingPhrases[0].length;
    let isDeleting = true; // start after initial display delay to erase and re-type
    const typeSpeed = 65;
    const deleteSpeed = 30;
    const holdTime = 2400; // Hold full phrase for readability

    function runTypingEffect() {
        const $el = $('.typing-text');
        if (!$el.length) return;

        const currentWord = typingPhrases[phraseIdx];

        if (isDeleting) {
            charIdx--;
            $el.text(currentWord.substring(0, charIdx));
        } else {
            charIdx++;
            $el.text(currentWord.substring(0, charIdx));
        }

        let nextSpeed = isDeleting ? deleteSpeed : typeSpeed;

        if (!isDeleting && charIdx === currentWord.length) {
            // Reached end of phrase, hold before deleting
            nextSpeed = holdTime;
            isDeleting = true;
        } else if (isDeleting && charIdx === 0) {
            // Finished deleting, move to next phrase
            isDeleting = false;
            phraseIdx = (phraseIdx + 1) % typingPhrases.length;
            nextSpeed = 400; // Pause before typing next phrase
        }

        setTimeout(runTypingEffect, nextSpeed);
    }

    // Initialize typing effect after initial pause
    setTimeout(runTypingEffect, 2000);

    // ==========================================
    // Interactive 3D Tilt & Specular Glare Engine
    // ==========================================
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (!prefersReducedMotion && !isTouchDevice) {
        const tiltCards = document.querySelectorAll('.project-card, .skill-card, .profile-glass-card, .column-card, .stat-card, [data-tilt]');

        tiltCards.forEach(card => {
            // Append 3D Glare overlay if not present
            if (!card.querySelector('.glare-3d')) {
                const glare = document.createElement('div');
                glare.className = 'glare-3d';
                card.appendChild(glare);
            }

            let isHovered = false;
            let rafId = null;

            card.addEventListener('mouseenter', () => {
                isHovered = true;
                card.style.transition = 'transform 0.15s ease-out, box-shadow 0.25s ease';
            });

            card.addEventListener('mousemove', (e) => {
                if (!isHovered) return;
                
                const rect = card.getBoundingClientRect();
                const width = rect.width;
                const height = rect.height;
                const mouseX = e.clientX - rect.left;
                const mouseY = e.clientY - rect.top;

                const centerX = width / 2;
                const centerY = height / 2;

                // Max tilt angle (degrees)
                const maxTilt = card.classList.contains('profile-glass-card') ? 9 : 11;
                const tiltX = ((mouseY - centerY) / centerY) * -maxTilt;
                const tiltY = ((mouseX - centerX) / centerX) * maxTilt;

                const glareX = ((mouseX / width) * 100).toFixed(1);
                const glareY = ((mouseY / height) * 100).toFixed(1);

                if (rafId) cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(() => {
                    card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`;
                    card.style.setProperty('--glare-x', `${glareX}%`);
                    card.style.setProperty('--glare-y', `${glareY}%`);
                });
            });

            card.addEventListener('mouseleave', () => {
                isHovered = false;
                if (rafId) cancelAnimationFrame(rafId);
                card.style.transition = 'transform 0.45s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease';
                card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
            });
        });
    }

    // ==========================================
    // 3D Perspective Scroll Reveal Observer
    // ==========================================
    if ('IntersectionObserver' in window && !prefersReducedMotion) {
        const revealElements = document.querySelectorAll('.project-card, .skill-card, .column-card, .feature-item, .contact-info-card, .contact-form-card');
        
        revealElements.forEach((el, idx) => {
            el.classList.add('reveal-3d');
            // Stagger transition delay slightly within grids
            const delay = (idx % 3) * 0.1;
            el.style.transitionDelay = `${delay}s`;
        });

        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active-3d');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.12,
            rootMargin: '0px 0px -40px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    // ==========================================
    // Interactive Cyber Network Constellation Canvas
    // ==========================================
    const canvas = document.getElementById('cyberNetworkCanvas');
    if (canvas && !prefersReducedMotion) {
        const ctx = canvas.getContext('2d');
        let width = canvas.width = window.innerWidth;
        let height = canvas.height = window.innerHeight;
        let isRunning = true;
        let mouseX = -9999;
        let mouseY = -9999;

        const isMobile = window.innerWidth < 768;
        const particleCount = isMobile ? 22 : 46;
        const maxDist = isMobile ? 85 : 120;
        const mouseDist = 140;

        const particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.55,
                vy: (Math.random() - 0.5) * 0.55,
                radius: Math.random() * 1.5 + 1.1,
                colorType: i % 3 === 0 ? 'cyan' : (i % 3 === 1 ? 'indigo' : 'teal')
            });
        }

        window.addEventListener('resize', () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        });

        window.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        window.addEventListener('mouseleave', () => {
            mouseX = -9999;
            mouseY = -9999;
        });

        document.addEventListener('visibilitychange', () => {
            isRunning = !document.hidden;
            if (isRunning) requestAnimationFrame(renderCanvas);
        });

        function renderCanvas() {
            if (!isRunning) return;
            ctx.clearRect(0, 0, width, height);

            const isLight = document.documentElement.getAttribute('data-theme') === 'light';
            const baseColor = isLight ? 'rgba(2, 132, 199,' : 'rgba(56, 189, 248,';
            const accentColor = isLight ? 'rgba(99, 102, 241,' : 'rgba(99, 102, 241,';
            const tealColor = isLight ? 'rgba(13, 148, 136,' : 'rgba(45, 212, 191,';

            // Update & draw particles
            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0) p.x = width;
                else if (p.x > width) p.x = 0;
                if (p.y < 0) p.y = height;
                else if (p.y > height) p.y = 0;

                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                let col = p.colorType === 'cyan' ? `${baseColor} 0.75)` : (p.colorType === 'indigo' ? `${accentColor} 0.75)` : `${tealColor} 0.75)`);
                ctx.fillStyle = col;
                ctx.fill();

                // Connect with nearby particles
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx = p.x - p2.x;
                    const dy = p.y - p2.y;
                    const dist = Math.hypot(dx, dy);

                    if (dist < maxDist) {
                        const alpha = (1 - dist / maxDist) * (isLight ? 0.22 : 0.35);
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.strokeStyle = `${baseColor} ${alpha})`;
                        ctx.lineWidth = 0.8;
                        ctx.stroke();
                    }
                }

                // Connect to mouse cursor
                if (mouseX > 0 && mouseY > 0) {
                    const mdx = p.x - mouseX;
                    const mdy = p.y - mouseY;
                    const mdist = Math.hypot(mdx, mdy);
                    if (mdist < mouseDist) {
                        const alpha = (1 - mdist / mouseDist) * (isLight ? 0.38 : 0.5);
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(mouseX, mouseY);
                        ctx.strokeStyle = `${tealColor} ${alpha})`;
                        ctx.lineWidth = 0.9;
                        ctx.stroke();
                    }
                }
            }

            requestAnimationFrame(renderCanvas);
        }

        renderCanvas();
    }

    // ==========================================
    // Interactive Magnetic Buttons Effect
    // ==========================================
    if (!prefersReducedMotion && !isTouchDevice) {
        const magneticElements = document.querySelectorAll('.btn-primary, .btn-glass, .nav-cta, .scroll-up-btn, .theme-toggle-btn');
        
        magneticElements.forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                btn.style.transform = `translate(${x * 0.16}px, ${y * 0.16}px)`;
            });

            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translate(0px, 0px)';
            });
        });
    }
});
