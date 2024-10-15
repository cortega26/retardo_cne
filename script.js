"use strict";

const CNEMonitor = (() => {
    console.log('CNEMonitor module initialized');

    /**
     * Updates a counter element with the time difference from a target date.
     * @param {string} elementId - The ID of the counter element.
     * @param {Date} targetDate - The target date to count from.
     */
    function updateCounter(elementId, targetDate) {
    console.log(`Updating counter: ${elementId}`);
    const counter = document.getElementById(elementId);
    if (!counter) {
        console.error(`Counter element with id ${elementId} not found`);
        return;
    }
    
    // Create spans for each time unit
    const spans = ['days', 'hours', 'minutes', 'seconds'].map(unit => {
        const span = document.createElement('span');
        span.className = unit;
        counter.appendChild(span);
        return span;
    });

    function update() {
        const now = new Date();
        const differenceInMs = now - targetDate;
        
        const days = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
        const hours = Math.floor((differenceInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((differenceInMs % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((differenceInMs % (1000 * 60)) / 1000);
        
        const units = [
            { value: days, singular: 'día', plural: 'días' },
            { value: hours, singular: 'hora', plural: 'horas' },
            { value: minutes, singular: 'minuto', plural: 'minutos' },
            { value: seconds, singular: 'segundo', plural: 'segundos' }
        ];

        units.forEach(({ value, singular, plural }, index) => {
            const span = spans[index];
            const newText = `<span class="number">${value}</span> ${value === 1 ? singular : plural}`;
            if (span.innerHTML !== newText) {
                span.innerHTML = newText;
            }
        });

        // Add pulsing effect to seconds
        spans[3].classList.add('pulse');
        setTimeout(() => spans[3].classList.remove('pulse'), 500);

        requestAnimationFrame(update);
    }
    
    update();
    console.log(`Counter ${elementId} update started`);
}

    // Target dates (Venezuela time, GMT-4)
    const targetDate1 = new Date('2024-07-30T22:00:00Z');
    const targetDate2 = new Date('2024-08-29T02:00:00Z');

    function toggleTheme() {
        console.log('Toggling theme');
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
        console.log(`Theme set to: ${isDarkMode ? 'dark' : 'light'}`);
    }

    function initializePage() {
        console.log('Initializing page');
        updateCounter('counter1', targetDate1);
        updateCounter('counter2', targetDate2);

        const toggleThemeBtn = document.getElementById('toggleTheme');
        if (toggleThemeBtn) {
            toggleThemeBtn.addEventListener('click', toggleTheme);
            console.log('Theme toggle button listener added');
        } else {
            console.warn('Theme toggle button not found');
        }

        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            console.log('Dark mode applied from saved preference');
        }

        // Initialize AOS
        if (typeof AOS !== 'undefined') {
            AOS.init({
                duration: 1000,
                once: true
            });
            console.log('AOS initialized');
        } else {
            console.warn('AOS library not found');
        }

        // Add Google Analytics pageview event
        if (typeof gtag === 'function') {
            console.log('Sending Google Analytics pageview event');
            try {
                gtag('event', 'page_view', {
                    page_title: document.title,
                    page_location: window.location.href,
                    page_path: window.location.pathname
                });
                console.log('Google Analytics pageview event sent successfully');
            } catch (error) {
                console.error('Error sending Google Analytics pageview event:', error);
            }
        } else {
            console.warn('Google Analytics gtag function not found. Make sure the Google Analytics script is loaded correctly.');
        }

        console.log('Page initialization complete');
    }

    // Public API
    return {
        init: initializePage,
        toggleTheme: toggleTheme
    };
})();

// Initialize the page when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded');
    CNEMonitor.init();
});

// Log any unhandled errors
window.addEventListener('error', (event) => {
    console.error('Unhandled error:', event.error);
});

// Check if Google Analytics is blocked by an ad blocker
window.addEventListener('load', () => {
    if (typeof gtag === 'undefined') {
        console.warn('Google Analytics might be blocked by an ad blocker or not loaded correctly');
    } else {
        console.log('Google Analytics (gtag) is available');
    }
});