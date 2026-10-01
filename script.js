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
        $('html').attr('data-theme', theme);
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

    // Sticky navbar on scroll
    $(window).scroll(function(){
        if(this.scrollY > 20){
            $('.navbar').addClass("sticky");
        } else {
            $('.navbar').removeClass("sticky");
        }
        
        // Scroll-up button toggle
        if(this.scrollY > 400){
            $('.scroll-up-btn').addClass("show");
        } else {
            $('.scroll-up-btn').removeClass("show");
        }

        // Active link highlighting
        const scrollPos = $(document).scrollTop() + 120;
        $('section').each(function() {
            const top = $(this).offset().top;
            const bottom = top + $(this).outerHeight();
            const id = $(this).attr('id');
            if (scrollPos >= top && scrollPos <= bottom) {
                $('.navbar .menu li a').removeClass('active');
                $('.navbar .menu li a[href="#' + id + '"]').addClass('active');
            }
        });
    });
    
    // Scroll up click
    $('.scroll-up-btn').click(function(){
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // Mobile menu toggle
    $('.menu-btn').click(function(){
        $('.navbar .menu').toggleClass("active");
        $('.menu-btn i').toggleClass("fa-times fa-bars");
    });

    // Close menu when clicking nav link
    $('.menu-btn-link').click(function(){
        $('.navbar .menu').removeClass("active");
        $('.menu-btn i').removeClass("fa-times").addClass("fa-bars");
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
});
