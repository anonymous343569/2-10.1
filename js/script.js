document.addEventListener('DOMContentLoaded', () => {
    initAudio();
    initPetals();
    initTransitions();
});

// --- Audio Persistence Logic ---
function initAudio() {
    const audio = new Audio('assets/audio/background-song.mp3');
    audio.loop = true;
    audio.volume = 0.4;

    const savedTime = localStorage.getItem('audioTime');
    const isMuted = localStorage.getItem('audioMuted') === 'true';
    const wasPlaying = localStorage.getItem('audioPlaying') === 'true';

    if (savedTime) {
        audio.currentTime = parseFloat(savedTime);
    }
    audio.muted = isMuted;

    // Attempt autoplay immediately
    const attemptPlay = () => {
        audio.play().then(() => {
            localStorage.setItem('audioPlaying', 'true');
        }).catch(err => {
            console.log("Autoplay waiting for interaction");
            // If autoplay fails, we wait for interaction
            const startOnInteraction = () => {
                audio.play().then(() => {
                    localStorage.setItem('audioPlaying', 'true');
                    document.removeEventListener('click', startOnInteraction);
                    document.removeEventListener('touchstart', startOnInteraction);
                });
            };
            document.addEventListener('click', startOnInteraction);
            document.addEventListener('touchstart', startOnInteraction);
        });
    };

    // If it was playing on the previous page, try to resume
    if (wasPlaying || window.location.pathname.includes('index.html')) {
        attemptPlay();
    }

    // Update localStorage state periodically
    setInterval(() => {
        if (!audio.paused) {
            localStorage.setItem('audioTime', audio.currentTime);
            localStorage.setItem('audioPlaying', 'true');
        } else {
            localStorage.setItem('audioPlaying', 'false');
        }
    }, 1000);

    // Save state before unload
    window.addEventListener('beforeunload', () => {
        localStorage.setItem('audioTime', audio.currentTime);
        localStorage.setItem('audioMuted', audio.muted);
        localStorage.setItem('audioPlaying', !audio.paused);
    });

    // Audio controls UI
    const muteBtn = document.getElementById('mute-toggle');
    if (muteBtn) {
        updateMuteIcon(muteBtn, audio.muted);
        muteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            audio.muted = !audio.muted;
            localStorage.setItem('audioMuted', audio.muted);
            updateMuteIcon(muteBtn, audio.muted);
        });
    }
}

function updateMuteIcon(btn, muted) {
    btn.innerHTML = muted ? `
        <svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
    ` : `
        <svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.74 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
    `;
}

// --- Rose Petals Animation ---
function initPetals() {
    const container = document.getElementById('petals-container');
    if (!container) return;

    const petalCount = 30;
    for (let i = 0; i < petalCount; i++) {
        createPetal(container);
    }

    // Performance optimization: slow down on scroll
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        container.classList.add('slow-petals');
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            container.classList.remove('slow-petals');
        }, 150);
    });
}

function createPetal(container) {
    const petal = document.createElement('div');
    petal.className = 'petal';

    const size = Math.random() * 15 + 10 + 'px';
    petal.style.width = size;
    petal.style.height = size;
    petal.style.left = Math.random() * 100 + 'vw';
    petal.style.animationDuration = Math.random() * 5 + 5 + 's';
    petal.style.animationDelay = Math.random() * 5 + 's';

    container.appendChild(petal);

    petal.addEventListener('animationiteration', () => {
        petal.style.left = Math.random() * 100 + 'vw';
    });
}

// --- Page Transitions ---
function initTransitions() {
    const links = document.querySelectorAll('a');
    const overlay = document.querySelector('.transition-overlay');

    links.forEach(link => {
        if (link.hostname === window.location.hostname && !link.hash) {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.href;
                overlay.classList.add('active');
                setTimeout(() => {
                    window.location.href = target;
                }, 600);
            });
        }
    });

    // Remove overlay on page load
    window.addEventListener('pageshow', (event) => {
        if (event.persisted) {
            overlay.classList.remove('active');
        }
    });
}
