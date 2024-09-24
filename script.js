"use strict";

const CNEMonitor = (() => {
    /**
     * Updates a counter element with the time difference from a target date.
     * @param {string} elementId - The ID of the counter element.
     * @param {Date} targetDate - The target date to count from.
     */
    function updateCounter(elementId, targetDate) {
        const counter = document.getElementById(elementId);
        if (!counter) {
            console.error(`Counter element with id ${elementId} not found`);
            return;
        }
        
        function update() {
            const now = new Date();
            const differenceInMs = now - targetDate;
            
            const days = Math.floor(differenceInMs / (1000 * 60 * 60 * 24));
            const hours = Math.floor((differenceInMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((differenceInMs % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((differenceInMs % (1000 * 60)) / 1000);
            
            counter.innerHTML = `
                <span>${days} día${days !== 1 ? 's' : ''}</span>
                <span>${hours} hora${hours !== 1 ? 's' : ''}</span>
                <span>${minutes} minuto${minutes !== 1 ? 's' : ''}</span>
                <span>${seconds} segundo${seconds !== 1 ? 's' : ''}</span>
            `;

            // Add pulsing effect to seconds
            const secondsSpan = counter.querySelector('span:last-child');
            secondsSpan.classList.add('pulse');
            setTimeout(() => secondsSpan.classList.remove('pulse'), 500);

            requestAnimationFrame(update);
        }
        
        update();
    }

    // Target dates (Venezuela time, GMT-4)
    const targetDate1 = new Date('2024-07-30T22:00:00Z');
    const targetDate2 = new Date('2024-08-28T16:00:00Z');

    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }

    function initializePage() {
        updateCounter('counter1', targetDate1);
        updateCounter('counter2', targetDate2);

        const toggleThemeBtn = document.getElementById('toggleTheme');
        if (toggleThemeBtn) {
            toggleThemeBtn.addEventListener('click', toggleTheme);
        }

        // Check for saved theme preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }

        // Initialize AOS
        AOS.init({
            duration: 1000,
            once: true
        });
    }

    // Public API
    return {
        init: initializePage,
        toggleTheme: toggleTheme
    };
})();

// Initialize the page when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', CNEMonitor.init);