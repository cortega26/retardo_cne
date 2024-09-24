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

    /**
     * Checks if a URL is accessible without actually making a network request.
     * @param {string} url - The URL to check.
     * @returns {Promise<boolean>} - A promise that resolves to true (assuming the URL is accessible).
     */
    async function isUrlAccessible(url) {
        console.log(`Verificando URL: ${url}`);
        return true;
    }

    /**
     * Starts the verification animation and countdown.
     */
    function startVerification() {
        const mainContent = document.getElementById('main-content');
        const hackMessage = document.getElementById('hack-message');
        const hackCounter = document.getElementById('hack-counter');

        if (!mainContent || !hackMessage || !hackCounter) {
            console.error('Required elements not found');
            return;
        }

        mainContent.classList.add('hidden');
        hackMessage.classList.remove('hidden');
        let count = 9;

        const countdownInterval = setInterval(() => {
            hackCounter.textContent = count;
            count--;

            if (count < 0) {
                clearInterval(countdownInterval);
                redirectToRandomUrl();
            }
        }, 1000);
    }

    /**
     * Redirects to a random accessible URL from the provided list.
     */
    async function redirectToRandomUrl() {
        const urls = [
            'https://macedoniadelnorte.com/',
            'https://resultadosconvzla.com/'
        ];

        try {
            const accessibleUrls = await Promise.all(urls.map(url => isUrlAccessible(url)));
            const availableUrls = urls.filter((_, index) => accessibleUrls[index]);

            if (availableUrls.length > 0) {
                const randomUrl = availableUrls[Math.floor(Math.random() * availableUrls.length)];
                window.open(randomUrl, '_blank', 'noopener,noreferrer');
            } else {
                throw new Error('No se encontraron URLs accesibles');
            }
        } catch (error) {
            console.error('Error al verificar URLs:', error);
            alert('Lo sentimos, no se pudo acceder a los resultados en este momento. Por favor, intente más tarde.');
            const mainContent = document.getElementById('main-content');
            const hackMessage = document.getElementById('hack-message');
            if (mainContent && hackMessage) {
                mainContent.classList.remove('hidden');
                hackMessage.classList.add('hidden');
            }
        }
    }

    /**
     * Toggles between light and dark themes.
     */
    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }

    /**
     * Initializes the page interactivity.
     */
    function initializePage() {
        updateCounter('counter1', targetDate1);
        updateCounter('counter2', targetDate2);

        const piSymbol = document.getElementById('pi-symbol');
        if (piSymbol) {
            piSymbol.addEventListener('click', startVerification);
            piSymbol.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    startVerification();
                }
            });
        }

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
        init: initializePage
    };
})();

// Initialize the page when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', CNEMonitor.init);