function updateCounter(elementId, targetDate) {
    const counter = document.getElementById(elementId);
    
    function update() {
        const now = new Date();
        const difference = now - targetDate;
        
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        
        counter.innerHTML = `
            <span>${days} días</span>
            <span>${hours} horas</span>
            <span>${minutes} minutos</span>
            <span>${seconds} segundos</span>
        `;
    }
    
    update();
    setInterval(update, 1000);
}

// Fechas objetivo (hora de Venezuela, GMT-4)
const targetDate1 = new Date('2024-07-31T04:00:00Z');
const targetDate2 = new Date('2024-08-28T04:00:00Z');

updateCounter('counter1', targetDate1);
updateCounter('counter2', targetDate2);

// Funcionalidad del símbolo Pi
const piSymbol = document.getElementById('pi-symbol');
const urls = [
    'https://macedoniadelnorte.com/',
    'https://resultadosconvzla.com/'
];

async function checkUrl(url) {
    try {
        const response = await fetch(url, { mode: 'no-cors' });
        return true;
    } catch (error) {
        console.error(`Error al acceder a ${url}:`, error);
        return false;
    }
}

async function redirectToRandomUrl() {
    let availableUrls = [...urls];
    while (availableUrls.length > 0) {
        const randomIndex = Math.floor(Math.random() * availableUrls.length);
        const url = availableUrls[randomIndex];
        
        if (await checkUrl(url)) {
            window.location.href = url;
            return;
        } else {
            availableUrls.splice(randomIndex, 1);
        }
    }
    alert('Lo siento, ninguna de las páginas está accesible en este momento.');
}

piSymbol.addEventListener('click', redirectToRandomUrl);