// Gallery Data removed - now using gallery-data.json

// DOM Elements
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');
const contactForm = document.getElementById('contactForm');

// Mobile Navigation Toggle - Open Services Menu
if (hamburger && navMenu && hamburger.dataset.navInitialized !== 'true') {
    hamburger.dataset.navInitialized = 'true';
    const servicesDropdown = document.querySelector('.nav-item-dropdown');
    const servicesDropdownMenu = document.querySelector('.nav-item-dropdown .nav-dropdown-menu');
    
hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
        if (servicesDropdown && servicesDropdownMenu && window.innerWidth <= 768) {
            servicesDropdownMenu.classList.toggle('show');
        }
});

// Close mobile menu when clicking on a link
    document.querySelectorAll('.nav-link, .nav-dropdown-link').forEach(n => n.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navMenu.classList.remove('active');
        if (servicesDropdownMenu && window.innerWidth <= 768) {
            servicesDropdownMenu.classList.remove('show');
        }
}));
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const offsetTop = target.offsetTop - 80;
            window.scrollTo({
                top: offsetTop,
                behavior: 'smooth'
            });
        }
    });
});


// Navbar background change on scroll
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    
    if (window.scrollY > 100) {
        navbar.classList.add('scrolled');
        navbar.style.background = 'rgba(255, 255, 255, 0.98)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.classList.remove('scrolled');
        navbar.style.background = 'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
});

// Active navigation link highlighting
window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// Gallery functionality is now in gallery.html

// Contact Form Submission
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const formValues = {
            name: document.getElementById('name').value,
            phone: document.getElementById('phone').value,
            email: document.getElementById('email').value,
            service: document.getElementById('service').value,
            message: document.getElementById('message').value
        };
        
        // Send to Web3Forms (free form service)
        // Get your access key from https://web3forms.com (free, no signup required)
        const formData = new FormData();
        formData.append('access_key', 'YOUR_WEB3FORMS_ACCESS_KEY'); // Replace with your key from web3forms.com
        formData.append('name', formValues.name);
        formData.append('phone', formValues.phone);
        formData.append('email', formValues.email || '');
        formData.append('service', formValues.service);
        formData.append('message', formValues.message);
        formData.append('subject', 'درخواست مشاوره از سایت NAROON');
        
        fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('درخواست شما با موفقیت ارسال شد!\n\nما در اسرع وقت با شما تماس خواهیم گرفت.');
        contactForm.reset();
            } else {
                alert('متأسفانه خطایی رخ داد. لطفاً دوباره تلاش کنید یا با ما تماس بگیرید.');
            }
        })
        .catch(error => {
            console.error('Form submission error:', error);
            alert('متأسفانه خطایی رخ داد. لطفاً دوباره تلاش کنید یا با ما تماس بگیرید.');
        });
    });
}

// Scroll Animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// FAQ Accordion Functionality
document.addEventListener('DOMContentLoaded', () => {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            
            // Close all items
            faqItems.forEach(faqItem => {
                faqItem.classList.remove('active');
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
            }
        });
    });
});

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    // Add scroll animations to elements
    const animateElements = document.querySelectorAll('.service-card, .step, .info-card, .feature-item');
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
    
    // Add animation to section headers
    const sectionHeaders = document.querySelectorAll('.section-header');
    sectionHeaders.forEach(header => {
        header.classList.add('fade-in');
        observer.observe(header);
    });
});

// Service card click handlers are now in HTML onclick
// Keep hover effects for better UX - disabled on mobile for performance
if (window.innerWidth > 768) {
    document.querySelectorAll('.service-card').forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (!this.style.transform.includes('translateY')) {
                this.style.transform = 'translateY(-10px)';
            }
        });
    });
}

// Add loading animation for images - optimized for mobile
document.querySelectorAll('img').forEach(img => {
    // Skip if image is already loaded
    if (img.complete && img.naturalHeight !== 0) {
        img.style.opacity = '1';
        return;
    }
    
    img.addEventListener('load', function() {
        this.style.opacity = '1';
    }, { once: true });
    
    // Only set opacity if not already set to avoid flicker
    if (!img.style.opacity) {
        img.style.opacity = '0';
        img.style.transition = 'opacity 0.3s ease';
    }
});

// Language Switcher System
(function() {
    'use strict';
    
    let currentLang = localStorage.getItem('siteLang') || 'fa';
    const htmlRoot = document.documentElement;
    const langToggleButtons = document.querySelectorAll('[data-lang-toggle]');
    
    // Initialize language on page load
    function initLanguage() {
        applyLanguage(currentLang);
        updateLangButtons();
    }
    
    // Apply language changes
    function applyLanguage(lang) {
        currentLang = lang;
        localStorage.setItem('siteLang', lang);
        
        // Change HTML direction and lang attribute
        if (lang === 'en') {
            htmlRoot.setAttribute('dir', 'ltr');
            htmlRoot.setAttribute('lang', 'en');
            document.body.classList.add('lang-en');
            document.body.classList.remove('lang-fa');
        } else {
            htmlRoot.setAttribute('dir', 'rtl');
            htmlRoot.setAttribute('lang', 'fa');
            document.body.classList.add('lang-fa');
            document.body.classList.remove('lang-en');
        }
        
        // Update all elements with data-fa and data-en attributes
        document.querySelectorAll('[data-fa][data-en]').forEach(element => {
            if (lang === 'en') {
                const enText = element.getAttribute('data-en');
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    // Check for placeholder-specific attributes
                    const enPlaceholder = element.getAttribute('data-en-placeholder');
                    element.placeholder = enPlaceholder || enText;
                } else if (element.tagName === 'IMG') {
                    element.alt = enText;
                } else {
                    // Handle elements with child spans (like dropdown triggers)
                    const span = element.querySelector('span:not(.lang-active):not(.lang-inactive):not(.lang-separator)');
                    if (span && !span.closest('.lang-btn')) {
                        // Preserve icon if exists
                        const icon = span.querySelector('i');
                        if (icon) {
                            span.innerHTML = enText + ' ' + icon.outerHTML;
                        } else {
                            span.textContent = enText;
                        }
                    } else {
                        // Preserve icons in the element
                        const icons = element.querySelectorAll('i');
                        if (icons.length > 0) {
                            const iconHTML = Array.from(icons).map(i => i.outerHTML).join(' ');
                            // Check if element has child span (like FAQ buttons)
                            const span = element.querySelector('span');
                            if (span) {
                                span.innerHTML = enText + ' ' + iconHTML;
                            } else {
                                element.innerHTML = enText + ' ' + iconHTML;
                            }
                        } else {
                            const span = element.querySelector('span');
                            if (span) {
                                span.textContent = enText;
                            } else {
                                element.textContent = enText;
                            }
                        }
                    }
                }
            } else {
                const faText = element.getAttribute('data-fa');
                if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                    const faPlaceholder = element.getAttribute('data-fa-placeholder');
                    element.placeholder = faPlaceholder || faText;
                } else if (element.tagName === 'IMG') {
                    element.alt = faText;
                } else {
                    const span = element.querySelector('span:not(.lang-active):not(.lang-inactive):not(.lang-separator)');
                    if (span && !span.closest('.lang-btn')) {
                        // Preserve icon if exists
                        const icon = span.querySelector('i');
                        if (icon) {
                            span.innerHTML = faText + ' ' + icon.outerHTML;
                        } else {
                            span.textContent = faText;
                        }
                    } else {
                        // Preserve icons in the element
                        const icons = element.querySelectorAll('i');
                        if (icons.length > 0) {
                            const iconHTML = Array.from(icons).map(i => i.outerHTML).join(' ');
                            // Check if element has child span (like FAQ buttons)
                            const span = element.querySelector('span');
                            if (span) {
                                span.innerHTML = faText + ' ' + iconHTML;
                            } else {
                                element.innerHTML = faText + ' ' + iconHTML;
                            }
                        } else {
                            const span = element.querySelector('span');
                            if (span) {
                                span.textContent = faText;
                            } else {
                                element.textContent = faText;
                            }
                        }
                    }
                }
            }
        });
        
        // Handle elements with data-fa-placeholder and data-en-placeholder
        document.querySelectorAll('[data-fa-placeholder][data-en-placeholder]').forEach(element => {
            if (lang === 'en') {
                element.placeholder = element.getAttribute('data-en-placeholder');
            } else {
                element.placeholder = element.getAttribute('data-fa-placeholder');
            }
        });
        
        // Handle option elements in select
        document.querySelectorAll('option[data-fa][data-en]').forEach(option => {
            if (lang === 'en') {
                option.textContent = option.getAttribute('data-en');
            } else {
                option.textContent = option.getAttribute('data-fa');
            }
        });

        window.dispatchEvent(new CustomEvent('languageChanged', {
            detail: { lang }
        }));
    }
    
    // Update language button appearance
    function updateLangButtons() {
        if (!langToggleButtons.length) return;
        
        langToggleButtons.forEach(button => {
            const activeSpan = button.querySelector('.lang-active');
            const inactiveSpan = button.querySelector('.lang-inactive');
            
            if (currentLang === 'en') {
                if (activeSpan) activeSpan.textContent = 'En';
                if (inactiveSpan) inactiveSpan.textContent = 'Fa';
            } else {
                if (activeSpan) activeSpan.textContent = 'Fa';
                if (inactiveSpan) inactiveSpan.textContent = 'En';
            }
        });
    }
    
    // Toggle language
    function toggleLanguage() {
        const newLang = currentLang === 'fa' ? 'en' : 'fa';
        applyLanguage(newLang);
        updateLangButtons();
    }
    
    // Event listener for language toggle
    if (langToggleButtons.length) {
        langToggleButtons.forEach(button => {
            button.addEventListener('click', toggleLanguage);
        });
    }
    
    // Initialize on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLanguage);
    } else {
        initLanguage();
    }
})();

// ERRORR Video Modal
(function() {
    'use strict';
    
    const errorrVideoBox = document.getElementById('errorrVideoBox');
    const errorrVideoModal = document.getElementById('errorrVideoModal');
    const errorrVideoModalClose = document.getElementById('errorrVideoModalClose');
    const errorrPreviewVideo = document.getElementById('errorrPreviewVideo');
    
    if (!errorrVideoBox || !errorrVideoModal || !errorrVideoModalClose || !errorrPreviewVideo) {
        return;
    }
    
    // Set video source
    const videoSource = errorrPreviewVideo.querySelector('source');
    if (videoSource) {
        // Set video path
        videoSource.src = 'videos/3d-preview_1.mp4';
        errorrPreviewVideo.load();
    }
    
    // Open modal
    errorrVideoBox.addEventListener('click', () => {
        errorrVideoModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        // Auto-play video when modal opens (optional)
        // errorrPreviewVideo.play().catch(err => console.log('Autoplay prevented:', err));
    });
    
    // Close modal
    function closeModal() {
        errorrVideoModal.classList.remove('active');
        document.body.style.overflow = '';
        errorrPreviewVideo.pause();
        errorrPreviewVideo.currentTime = 0;
    }
    
    errorrVideoModalClose.addEventListener('click', closeModal);
    
    // Close on overlay click
    errorrVideoModal.addEventListener('click', (e) => {
        if (e.target === errorrVideoModal || e.target.classList.contains('errorr-video-modal-overlay')) {
            closeModal();
        }
    });
    
    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && errorrVideoModal.classList.contains('active')) {
            closeModal();
        }
    });
})();
