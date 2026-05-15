// Enhanced Keyboard Accessibility Implementation

// Get all interactive elements
const interactiveElements = document.querySelectorAll(
    'button, .feature-box, .step, .testimonial, .faq-question'
);

// Make all interactive elements focusable and add tabindex if needed
interactiveElements.forEach(el => {
    if (!el.hasAttribute('tabindex')) {
        el.setAttribute('tabindex', '0');
    }
});

// Track currently focused element index
let currentFocusIndex = -1;

// Update current focus index
function updateCurrentFocusIndex() {
    currentFocusIndex = Array.from(interactiveElements).indexOf(document.activeElement);
}

// Move focus to next element
function focusNextElement() {
    if (currentFocusIndex < interactiveElements.length - 1) {
        currentFocusIndex++;
        interactiveElements[currentFocusIndex].focus();
    }
}

// Move focus to previous element
function focusPrevElement() {
    if (currentFocusIndex > 0) {
        currentFocusIndex--;
        interactiveElements[currentFocusIndex].focus();
    }
}

// Move focus to first element
function focusFirstElement() {
    currentFocusIndex = 0;
    interactiveElements[currentFocusIndex].focus();
}

// Move focus to last element
function focusLastElement() {
    currentFocusIndex = interactiveElements.length - 1;
    interactiveElements[currentFocusIndex].focus();
}

// Handle keyboard navigation
function handleKeyboardNavigation(e) {
    // Update current focus index
    updateCurrentFocusIndex();

    // Handle arrow keys and tab
    switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
            e.preventDefault();
            focusNextElement();
            break;
        case 'ArrowUp':
        case 'ArrowLeft':
            e.preventDefault();
            focusPrevElement();
            break;
        case 'Home':
            e.preventDefault();
            focusFirstElement();
            break;
        case 'End':
            e.preventDefault();
            focusLastElement();
            break;
        case 'Tab':
            // Let default tab behavior work, but update our index
            setTimeout(updateCurrentFocusIndex, 10);
            break;
    }
}

// Add keyboard event listener to document
document.addEventListener('keydown', handleKeyboardNavigation);

// Initialize current focus index on page load
document.addEventListener('DOMContentLoaded', () => {

    // Update focus index when user interacts with page
    document.addEventListener('click', updateCurrentFocusIndex);
    document.addEventListener('focusin', updateCurrentFocusIndex);
});

// FAQ toggle functionality with enhanced accessibility
document.querySelectorAll('.faq-question').forEach(question => {
    // Click handler
    question.addEventListener('click', () => {
        toggleFAQ(question);
    });

    // Enhanced keyboard accessibility for FAQ
    question.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleFAQ(question);
        }
    });
});

// Function to toggle FAQ item
function toggleFAQ(question) {
    const item = question.parentNode;
    const isActive = item.classList.contains('active');

    // Close all other FAQ items
    document.querySelectorAll('.faq-item').forEach(faqItem => {
        if (faqItem !== item) {
            faqItem.classList.remove('active');
        }
    });

    // Toggle current item
    item.classList.toggle('active');

    // Update ARIA attributes for accessibility
    const answer = item.querySelector('.faq-answer');
    if (item.classList.contains('active')) {
        question.setAttribute('aria-expanded', 'true');
        answer.setAttribute('aria-hidden', 'false');
    } else {
        question.setAttribute('aria-expanded', 'false');
        answer.setAttribute('aria-hidden', 'true');
    }
}

// Initialize ARIA attributes for FAQ
document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    question.setAttribute('aria-expanded', 'false');
    question.setAttribute('aria-controls', answer.id || `faq-answer-${Math.random().toString(36).substr(2, 9)}`);
    answer.setAttribute('aria-hidden', 'true');

    if (!answer.id) {
        answer.id = question.getAttribute('aria-controls');
    }
});

// Add interactive behavior to feature boxes, steps, and testimonials
document.querySelectorAll('.feature-box, .step, .testimonial').forEach(element => {
    // Add click handler
    element.addEventListener('click', () => {
        handleInteractiveElementClick(element);
    });

    // Add keyboard handler
    element.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleInteractiveElementClick(element);
        }
    });
});

// Function to handle interactive element clicks
function handleInteractiveElementClick(element) {
    // Add visual feedback
    element.style.transform = 'scale(0.98)';
    setTimeout(() => {
        element.style.transform = '';
    }, 150);

    // In a real application, you would navigate to appropriate section
    // For demo purposes, we'll just log the action
    console.log(`Interacted with: ${element.querySelector('h3')?.textContent || 'Interactive element'}`);
}

// Handle CTA button actions
document.getElementById('start-free-btn')?.addEventListener('click', () => {
   window.location.href="/signup"
});

document.getElementById('sign-in-btn')?.addEventListener('click', () => {
    window.location.href="/login";
});

document.getElementById('cta-btn')?.addEventListener('click', () => {
    window.location.href="/signup";
});

// Add keyboard handlers for CTA buttons
document.getElementById('start-free-btn')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        document.getElementById('start-free-btn').click();
    }
});

document.getElementById('sign-in-btn')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        document.getElementById('sign-in-btn').click();
    }
});

document.getElementById('cta-btn')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        document.getElementById('cta-btn').click();
    }
});

// Scroll animations
function checkVisibility() {
    const elements = document.querySelectorAll('.feature-box, .step, .testimonial');

    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;

        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('visible');
        }
    });
}

window.addEventListener('scroll', checkVisibility);
window.addEventListener('load', checkVisibility);