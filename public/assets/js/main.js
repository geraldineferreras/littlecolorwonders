// Main JavaScript for Little Color Wonders Landing Page

document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize all functionality
    initSmoothScrolling();
    initFAQ();
    initFormHandling();
    initScrollAnimations();
    initMobileMenu();
    
    console.log('Little Color Wonders - Landing page loaded successfully!');
});

// Smooth scrolling for navigation links
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerHeight = document.querySelector('header').offsetHeight;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// FAQ accordion functionality
function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', () => {
            const answer = question.nextElementSibling;
            const isActive = question.classList.contains('active');
            
            // Close all FAQ items
            document.querySelectorAll('.faq-question').forEach(q => {
                q.classList.remove('active');
                q.nextElementSibling.classList.remove('active');
            });
            
            // Toggle current item if it wasn't active
            if (!isActive) {
                question.classList.add('active');
                answer.classList.add('active');
            }
        });
    });
}

// Form handling for newsletter signup
function initFormHandling() {
    const form = document.querySelector('.opt-in-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nameInput = form.querySelector('input[type="text"]');
        const emailInput = form.querySelector('input[type="email"]');
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Basic validation
        if (!nameInput.value.trim() || !emailInput.value.trim()) {
            showFormMessage('Please fill in all fields.', 'error');
            return;
        }
        
        if (!isValidEmail(emailInput.value)) {
            showFormMessage('Please enter a valid email address.', 'error');
            return;
        }
        
        // Show loading state
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="loading"></span> Sending...';
        submitBtn.disabled = true;
        
        // Simulate form submission (replace with actual API call)
        setTimeout(() => {
            showFormMessage('Thank you! Your free pages will be sent to your email shortly.', 'success');
            form.reset();
            
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
            
            // Redirect to thank you page after successful signup
            setTimeout(() => {
                window.location.href = 'thank-you.html';
            }, 2000);
            
        }, 2000);
    });
}

// Email validation helper
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Show form messages
function showFormMessage(message, type) {
    let messageEl = document.querySelector('.form-message');
    
    if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.className = 'form-message';
        document.querySelector('.opt-in-form').appendChild(messageEl);
    }
    
    messageEl.textContent = message;
    messageEl.className = `form-message ${type}`;
    messageEl.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}

// Scroll animations
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);
    
    // Add fade-in class to elements and observe them
    document.querySelectorAll('.feature-card, .preview-item, .testimonial').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

// Mobile menu functionality
function initMobileMenu() {
    const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
    const navLinks = document.querySelector('.nav-links');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            mobileMenuBtn.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('active');
                mobileMenuBtn.classList.remove('active');
            });
        });
    }
}

// Product preview lightbox (for future enhancement)
function initProductPreview() {
    document.querySelectorAll('.preview-item').forEach(item => {
        item.addEventListener('click', () => {
            // Add lightbox functionality here
            console.log('Preview clicked:', item.querySelector('h3').textContent);
        });
    });
}

// Analytics tracking (replace with your analytics service)
function trackEvent(eventName, eventData = {}) {
    // Google Analytics 4 example
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, eventData);
    }
    
    // Facebook Pixel example
    if (typeof fbq !== 'undefined') {
        fbq('track', eventName, eventData);
    }
    
    console.log('Event tracked:', eventName, eventData);
}

// Track CTA button clicks
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('cta-button')) {
        trackEvent('cta_click', {
            button_text: e.target.textContent,
            page_location: window.location.href
        });
    }
    
    if (e.target.classList.contains('final-cta-button')) {
        trackEvent('purchase_intent', {
            button_text: e.target.textContent,
            page_location: window.location.href
        });
    }
});

// Scroll progress indicator (optional enhancement)
function initScrollProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 0%;
        height: 3px;
        background: linear-gradient(135deg, #ff6b9d 0%, #87ceeb 100%);
        z-index: 9999;
        transition: width 0.1s ease;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const windowHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = (window.scrollY / windowHeight) * 100;
        progressBar.style.width = scrolled + '%';
    });
}

// Initialize scroll progress (uncomment to enable)
// initScrollProgress();

// Utility functions
const utils = {
    // Debounce function for performance
    debounce: function(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Check if element is in viewport
    isInViewport: function(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    },
    
    // Format currency
    formatCurrency: function(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }
};

// Export utils for use in other scripts
    window.LittleColorWonders = {
    utils: utils,
    trackEvent: trackEvent
}; 