// Smooth scrolling for CTA buttons
function scrollToCTA() {
    document.getElementById('final-cta').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

// Email form handling
document.addEventListener('DOMContentLoaded', function() {
    // Hero email form
    const heroEmailForm = document.getElementById('heroEmailForm');
    if (heroEmailForm) {
        heroEmailForm.addEventListener('submit', handleEmailSubmission);
    }

    // Final email form
    const finalEmailForm = document.getElementById('finalEmailForm');
    if (finalEmailForm) {
        finalEmailForm.addEventListener('submit', handleEmailSubmission);
    }

    // Nav CTA button
    const navCtaBtn = document.querySelector('.nav-cta-btn');
    if (navCtaBtn) {
        navCtaBtn.addEventListener('click', scrollToCTA);
    }
});

// Email submission handler
async function handleEmailSubmission(e) {
    e.preventDefault();
    
    const form = e.target;
    const email = form.querySelector('input[type="email"]').value;
    const submitBtn = form.querySelector('button[type="submit"]');
    
    // Add loading state
    submitBtn.classList.add('loading');
    submitBtn.textContent = 'Joining...';
    
    try {
        // Log email to Google Sheets
        await logEmailToGoogleSheets(email, form.id);
        
        // Success state
        submitBtn.classList.remove('loading');
        submitBtn.textContent = '✅ You\'re in!';
        submitBtn.style.background = '#10b981';
        
        // Show success message
        showNotification('Thanks! We\'ll send you early access soon.', 'success');
        
        // Reset form after delay
        setTimeout(() => {
            form.reset();
            submitBtn.textContent = form.id === 'heroEmailForm' ? 'Get Started' : 'Get Started Free';
            submitBtn.style.background = '';
        }, 3000);
        
        // Track the email capture
        console.log('Email captured and logged:', email);
        
    } catch (error) {
        // Error state
        submitBtn.classList.remove('loading');
        submitBtn.textContent = 'Try Again';
        submitBtn.style.background = '#ef4444';
        
        // Show error message
        showNotification('Something went wrong. Please try again.', 'error');
        
        // Reset button after delay
        setTimeout(() => {
            submitBtn.textContent = form.id === 'heroEmailForm' ? 'Get Started' : 'Get Started Free';
            submitBtn.style.background = '';
        }, 3000);
        
        console.error('Error logging email:', error);
    }
}

// Google Sheets integration
async function logEmailToGoogleSheets(email, formSource) {
    // Replace this URL with your Google Apps Script Web App URL
    const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwzr5Og_ukROq9rOrpyd-xwBN70r1DPuTIRJBRQgAKkce3UxG2nlCzOBNGxAdqic21E/exec';

    // Use FormData to avoid CORS preflight
    const formData = new FormData();
    formData.append('email', email);
    formData.append('source', formSource === 'heroEmailForm' ? 'Hero Section' : 'Final CTA');
    formData.append('timestamp', new Date().toISOString());
    formData.append('userAgent', navigator.userAgent);
    formData.append('referrer', document.referrer || 'Direct');

    const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: formData
        // No custom headers!
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
            <button class="notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 9999;
        max-width: 400px;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add notification to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease-in forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.2s ease;
    }
    
    .notification-close:hover {
        background: rgba(255, 255, 255, 0.2);
    }
`;
document.head.appendChild(style);

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.6s ease-out forwards';
        }
    });
}, observerOptions);

// Observe all sections for animations
document.addEventListener('DOMContentLoaded', function() {
    const sections = document.querySelectorAll('.pain-section, .outcome-section, .product-section');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        observer.observe(section);
    });
});

// Add fade in animation CSS
const animationStyle = document.createElement('style');
animationStyle.textContent = `
    @keyframes fadeInUp {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(animationStyle);

// Track user interactions for analytics
function trackEvent(eventName, properties = {}) {
    // Replace with your analytics service (Google Analytics, Mixpanel, etc.)
    console.log('Event tracked:', eventName, properties);
    
    // Example for Google Analytics
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, properties);
    }
}

// Track form submissions
document.addEventListener('submit', function(e) {
    if (e.target.classList.contains('email-form') || e.target.classList.contains('final-email-form')) {
        trackEvent('email_submitted', {
            form_location: e.target.id === 'heroEmailForm' ? 'hero' : 'final_cta'
        });
    }
});

// Track CTA clicks
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('primary-cta') || e.target.classList.contains('nav-cta-btn')) {
        trackEvent('cta_clicked', {
            cta_location: e.target.classList.contains('nav-cta-btn') ? 'navigation' : 'hero'
        });
    }
});

// Navbar scroll effect
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', function() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        // Scrolling down
        navbar.style.transform = 'translateY(-100%)';
    } else {
        // Scrolling up
        navbar.style.transform = 'translateY(0)';
    }
    
    lastScrollTop = scrollTop;
});

// Add transition to navbar
navbar.style.transition = 'transform 0.3s ease';

// Stripe integration placeholder
function initializeStripe() {
    // This would be your actual Stripe integration
    // Replace with your Stripe publishable key
    // const stripe = Stripe('pk_test_your_stripe_key_here');
    
    console.log('Stripe integration ready for payment processing');
}

// Initialize Stripe when page loads
document.addEventListener('DOMContentLoaded', initializeStripe);

// Progressive Web App features
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed');
            });
    });
}
