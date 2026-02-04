import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// Data Source (Fetched from Database)
let MOVIES = [];
let auth;
let provider;

// Auth & Profile Logic
async function initAuth() {
    try {
        const response = await fetch('http://localhost:3000/api/config/firebase');
        if (!response.ok) throw new Error('Failed to load Firebase config');
        const firebaseConfig = await response.json();

        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        provider = new GoogleAuthProvider();

        onAuthStateChanged(auth, (user) => {
            if (user) {
                console.log("Authenticated as:", user.email);
                updateUserProfile(user);
                syncUserWithDB(user); // Sync to DB
                // Ensure profile is visible
                const p = document.querySelector('.user-profile');
                if (p) p.style.display = 'flex';  // Hide modal if open
                const modal = document.getElementById('signin-modal');
                if (modal) modal.style.display = 'none';
            } else {
                console.warn("User not authenticated. Browsing mode active.");
            }
        });

        setupProfileEvents();
        setupSliderAuthEvents();

    } catch (error) {
        console.error("Auth Init Error:", error);
    }
}

function setupSliderAuthEvents() {
    const modal = document.getElementById('signin-modal');
    const closeBtn = modal ? modal.querySelector('.modal-close') : null;
    const googleBtn = document.getElementById('google-auth-btn-slider');

    if (closeBtn && modal) {
        closeBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
        window.addEventListener('click', (e) => {
            if (e.target === modal) modal.style.display = 'none';
        });
    }

    if (googleBtn) {
        googleBtn.addEventListener('click', async () => {
            if (!auth) return;
            try {
                await signInWithPopup(auth, provider);
                // onAuthStateChanged handles UI update
            } catch (error) {
                console.error("Slider Google Key Error:", error);
                alert("Login Failed: " + error.message);
            }
        });
    }
}

function updateUserProfile(user) {
    const avatar = document.getElementById('user-avatar');
    const nameSpan = document.getElementById('user-name');

    if (nameSpan) {
        nameSpan.textContent = user.displayName || user.email.split('@')[0];
    }

    if (avatar && user.photoURL) {
        avatar.src = user.photoURL;
    } else if (avatar && user.email) {
        // Fallback to initials
        const initial = user.email[0].toUpperCase();
        avatar.src = `https://ui-avatars.com/api/?name=${initial}&background=random`;
    }
}

function setupProfileEvents() {
    const profileContainer = document.querySelector('.user-profile');
    const avatar = document.getElementById('user-avatar');
    const logoutBtn = document.getElementById('btn-logout');

    if (avatar && profileContainer) {
        profileContainer.addEventListener('click', (e) => {
            console.log("Profile clicked"); // Debug log
            e.stopPropagation();
            profileContainer.classList.toggle('active');
        });

        // Close dropdown when clicking outside
        window.addEventListener('click', () => {
            profileContainer.classList.remove('active');
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.stopPropagation();
            try {
                await signOut(auth);
                window.location.href = 'index.html'; // Redirect to home on logout
            } catch (error) {
                console.error("Logout failed:", error);
            }
        });
    }
}

async function syncUserWithDB(user) {
    console.log("[Sync] Attempting to sync user:", user.email, user.photoURL);
    try {
        const res = await fetch('http://localhost:3000/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL
            })
        });
        const data = await res.json();
        console.log("[Sync] Result:", data);
    } catch (err) {
        console.error("Sync Error:", err);
    }
}



// Start Auth after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
});

async function fetchMovies() {
    try {
        const response = await fetch('http://localhost:3000/api/movies');
        if (!response.ok) throw new Error('API request failed');
        const dbMovies = await response.json();

        if (dbMovies && dbMovies.length > 0) {
            MOVIES = dbMovies.map(m => ({
                title: m.title,
                rating: m.rating || "N/A",
                genre: m.genre,
                description: m.description || "No description available.",
                cover: m.poster_url || "images/default_cover.jpg",
                character: m.character_url || m.poster_url || "images/default_char.png",
                trailer: m.trailer_url || "",
                // Parse cast if it's a string (JSON column might come as string or object depending on driver/config)
                cast: typeof m.cast === 'string' ? JSON.parse(m.cast) : (m.cast || [])
            }));

            console.log("Movies loaded successfully from Database");
        } else {
            console.warn("Database connected but returned no movies.");
        }
    } catch (e) {
        console.error("CRITICAL: Could not fetch movies from server.", e);
        // User requested no fallback, so we leave MOVIES empty or show error
        const stage = document.querySelector('.stage');
        if (stage) stage.innerHTML = '<div style="color:white;text-align:center;padding-top:20vh;"><h1>Connection Error</h1><p>Could not load movies from database.</p></div>';
    }
}

// Physics constants
const FRICTION = 0.9;
const WHEEL_SENS = 0.6;
const DRAG_SENS = 1.0;

// Visual constants
const MAX_ROTATION = 28;
const MAX_DEPTH = 140;
const MIN_SCALE = 0.92;
const SCALE_RANGE = 0.1;
const GAP = 28;


const stage = document.querySelector('.stage');
const cardsRoot = document.getElementById('cards');
const bgContainer = document.getElementById('bg-video-container'); // Changed from canvas to div
const loader = document.getElementById('loader');

// Showcase Elements
const showcase = document.getElementById('showcase');
const showcaseClose = document.querySelector('.showcase__close');
const showcaseTitle = document.getElementById('showcase-title');
const showcaseDesc = document.getElementById('showcase-desc');
const showcaseImg = document.getElementById('showcase-img');
const showcaseDate = document.querySelector('.showcase__date');


let items = [];
let positions = [];
let activeIndex = -1;
let isEntering = true;

let CARD_W = 300;
let CARD_H = 400;
let STEP = CARD_W + GAP;
let TRACK = 0;
let SCROLL_X = 0;
let VW_HALF = window.innerWidth * 0.5;
let vX = 0;

let rafId = null;
let lastTime = 0;


function mod(n, m) {
    return ((n % m) + m) % m;
}



function createCards() {
    cardsRoot.innerHTML = '';
    items = [];

    const fragment = document.createDocumentFragment();

    MOVIES.forEach((movie, i) => {
        const card = document.createElement('article');
        card.className = 'card';
        card.style.willChange = 'transform';

        // Wrap image in container
        const imgWrapper = document.createElement('div');
        imgWrapper.className = 'card__img-wrapper';

        const img = new Image();
        img.className = 'card__img';
        img.draggable = false;
        img.src = movie.cover;
        imgWrapper.appendChild(img);

        // Info below card
        const info = document.createElement('div');
        info.className = 'card__info';
        info.innerHTML = `
            <h3 class="card__title">${movie.title}</h3>
            <div class="card__meta">
                <span class="card__rating">★ ${movie.rating}</span>
                <span class="card__genre">${movie.genre}</span>
            </div>
        `;

        card.appendChild(imgWrapper);
        card.appendChild(info);
        fragment.appendChild(card);

        // Add index for click tracking
        card.dataset.index = i;

        items.push({ el: card, x: i * STEP });

    });

    cardsRoot.appendChild(fragment);
}

// Showcase Elements
const showcaseHero = document.getElementById('showcase-hero');
const showcaseVideo = document.getElementById('showcase-video');
const showcaseVideoContainer = document.getElementById('showcase-video-container');
const showcaseGenre = document.getElementById('showcase-genre');
const ratingImdb = document.getElementById('rating-imdb');
const ratingRt = document.getElementById('rating-rt');
const ratingMc = document.getElementById('rating-mc');
const watchNowBtn = document.getElementById('watch-now-btn');
const sidebarItems = document.querySelectorAll('.sidebar-item');
let currentMovie = null;
let activeTab = 'overview';

function openShowcase(movie) {
    if (!showcase) return;
    currentMovie = movie;

    // Populate Title & Description
    showcaseTitle.innerText = movie.title;
    showcaseDesc.innerText = movie.description || "No description available.";

    // Populate Genre
    if (showcaseGenre) showcaseGenre.innerText = movie.genre || "";

    // Generate Recommendations (Client-side for now)
    populateRecommendations(movie);

    // Populate Ratings (use existing rating as IMDb, generate others)
    if (ratingImdb) ratingImdb.innerText = movie.rating || "N/A";
    if (ratingRt) ratingRt.innerText = movie.ratings?.rt || (movie.rating !== "TBA" ? Math.round(parseFloat(movie.rating) * 10) + "%" : "TBA");
    if (ratingMc) ratingMc.innerText = movie.ratings?.mc || (movie.rating !== "TBA" ? Math.round(parseFloat(movie.rating) * 8) : "TBA");

    // Set Hero Image - FORCE refresh by clearing first
    if (showcaseImg) {
        showcaseImg.src = ''; // Clear first to force reload
        showcaseImg.onerror = function () { this.src = movie.cover; };
        showcaseImg.src = movie.character || movie.cover;
    }

    // Set Video Source & Preload
    if (showcaseVideo && movie.trailer) {
        showcaseVideo.src = movie.trailer;
        showcaseVideo.preload = 'auto';
        showcaseVideo.load(); // Trigger load without muting
    }

    // Reset to Overview tab (this also resets video container visibility)
    switchTab('overview');

    // Show Showcase
    showcase.classList.add('active');
    videoMap.forEach(v => v.video.pause());
}

function switchTab(tabName) {
    activeTab = tabName; // Track active tab

    // Update sidebar active states (no glow, just simple highlight)
    sidebarItems.forEach(item => {
        if (item.dataset.tab === tabName) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Always stop video when switching tabs
    if (showcaseVideo) {
        showcaseVideo.pause();
    }

    // Toggle content visibility based on tab
    if (tabName === 'trailers') {
        // Tab 03 Trailers - show video player in showcase area
        if (showcaseHero) showcaseHero.style.display = 'none';
        if (showcaseVideoContainer) {
            showcaseVideoContainer.style.display = 'flex';
            if (showcaseVideo) {
                showcaseVideo.play().catch(e => console.log('Autoplay blocked:', e));
            }
        }
    } else {
        // Tab 01 Overview or Tab 02 Related - show hero image only (NO video)
        if (showcaseHero) showcaseHero.style.display = 'flex';
        if (showcaseVideoContainer) showcaseVideoContainer.style.display = 'none';
    }
}

// Watch Now button - INDEPENDENT fullscreen trailer (not related to tabs)
function playTrailer() {
    // Open video in true fullscreen - completely independent from tab system
    if (showcaseVideo && currentMovie && currentMovie.trailer) {
        // MUST show video container first, otherwise fullscreen shows black with audio only
        if (showcaseVideoContainer) {
            showcaseVideoContainer.style.display = 'flex';
        }
        if (showcaseHero) {
            showcaseHero.style.display = 'none';
        }

        showcaseVideo.src = currentMovie.trailer;
        showcaseVideo.load();

        // Request fullscreen on the VIDEO element itself (not container)
        const goFullscreen = () => {
            if (showcaseVideo.requestFullscreen) {
                showcaseVideo.requestFullscreen().catch(e => console.log('Fullscreen failed:', e));
            } else if (showcaseVideo.webkitRequestFullscreen) {
                showcaseVideo.webkitRequestFullscreen();
            } else if (showcaseVideo.webkitEnterFullscreen) {
                showcaseVideo.webkitEnterFullscreen(); // iOS Safari
            }
        };

        showcaseVideo.play().then(() => {
            goFullscreen();
        }).catch(e => {
            console.log('Autoplay blocked:', e);
            goFullscreen(); // Try fullscreen anyway
        });
    }
}

// Fullscreen exit handler - works for Trailers tab
function handleFullscreenExit() {
    // Check if we just EXITED fullscreen
    if (document.fullscreenElement || document.webkitFullscreenElement) return;

    // Small delay to let browser finish restoring DOM
    setTimeout(() => {
        // Check DOM for active tab
        const trailerTab = document.querySelector('.sidebar-item[data-tab="trailers"]');
        const isTrailersActive = trailerTab && trailerTab.classList.contains('active');

        if (isTrailersActive || activeTab === 'trailers') {
            // FORCE Trailers tab state
            if (showcaseHero) {
                showcaseHero.style.cssText = 'display: none !important;';
            }
            if (showcaseVideoContainer) {
                showcaseVideoContainer.style.cssText = 'display: flex !important;';
            }
            // Resume video
            if (showcaseVideo && showcaseVideo.paused) {
                showcaseVideo.play().catch(() => { });
            }
            return;
        }

        // Overview/Related - show poster
        if (showcaseVideo) showcaseVideo.pause();
        if (showcaseHero) showcaseHero.style.display = 'flex';
        if (showcaseVideoContainer) showcaseVideoContainer.style.display = 'none';
    }, 50);
}

// Listen for fullscreen exit on all browsers
document.addEventListener('fullscreenchange', handleFullscreenExit);
document.addEventListener('webkitfullscreenchange', handleFullscreenExit);

// Sidebar click handlers
sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
        const tab = item.dataset.tab;
        if (tab) switchTab(tab);
    });
});

// Watch Now button handler
if (watchNowBtn) {
    watchNowBtn.addEventListener('click', playTrailer);
}

if (showcaseClose) {
    showcaseClose.addEventListener('click', () => {
        showcase.classList.remove('active');
        // Stop showcase video
        if (showcaseVideo) showcaseVideo.pause();
        // Resume active video
        if (activeIndex !== -1 && videoMap[activeIndex]) {
            videoMap[activeIndex].video.play().catch(e => { });
        }
    });
}

function measure() {
    const sample = items[0]?.el;
    if (!sample) return;

    const r = sample.getBoundingClientRect();
    CARD_W = r.width || CARD_W;
    CARD_H = r.height || CARD_H;
    STEP = CARD_W + GAP;
    TRACK = items.length * STEP;

    items.forEach((it, i) => {
        it.x = i * STEP;
    });

    positions = new Float32Array(items.length);
}


// VIDEO BACKGROUND LOGIC


const videoMap = [];

function createVideoBackgrounds() {
    MOVIES.forEach((movie, index) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'bg-video-wrapper';

        const video = document.createElement('video');
        video.src = movie.trailer; // Removed unreliable #t fragment
        video.muted = true;
        video.loop = false;
        video.preload = 'auto'; // Preload auto to ensure seeking works

        // Set initial time once metadata loads
        video.addEventListener('loadedmetadata', () => {
            video.currentTime = 10;
        });

        // Loop logic: 10s loop (10s to 20s)
        video.addEventListener('timeupdate', () => {
            if (video.currentTime >= 20) {
                video.currentTime = 10;
                video.play();
            }
        });

        wrapper.appendChild(video);
        bgContainer.appendChild(wrapper);
        videoMap.push({ wrapper, video });
    });
}

function setActiveVideo(idx) {
    if (idx === activeIndex) return;
    activeIndex = idx;

    // Deactivate all
    videoMap.forEach((v, i) => {
        if (i === idx) {
            v.wrapper.classList.add('active');
            // Ensure we start at 10s if it somehow reset or is at 0
            if (v.video.currentTime < 10) {
                v.video.currentTime = 10;
            }
            v.video.play().catch(e => console.log("Play failed:", e));
        } else {
            v.wrapper.classList.remove('active');
            // Pause others after transition to save resources
            setTimeout(() => {
                if (i !== activeIndex) {
                    v.video.pause();
                    // Optional: Reset to 10s so it's ready for next time
                    // v.video.currentTime = 10; 
                }
            }, 1000);
        }
    });
}



function computeTransformComponents(screenX) {
    const norm = Math.max(-1, Math.min(1, screenX / VW_HALF));
    const absNorm = Math.abs(norm);
    const invNorm = 1 - absNorm;

    const ry = -norm * MAX_ROTATION;
    const tz = invNorm * MAX_DEPTH;
    const scale = MIN_SCALE + invNorm * SCALE_RANGE;

    return { ry, tz, scale };
}

function transformForScreenX(screenX) {
    const { ry, tz, scale } = computeTransformComponents(screenX);
    return {
        transform: `translate3d(${screenX}px,-50%,${tz}px) rotateY(${ry}deg) scale(${scale})`,
        z: tz,
    };
}

function updateCarouselTransforms() {
    const half = TRACK / 2;
    let closestIdx = -1;
    let closestDist = Infinity;

    for (let i = 0; i < items.length; i++) {
        let pos = items[i].x - SCROLL_X;
        if (pos < -half) pos += TRACK;
        if (pos > half) pos -= TRACK;

        positions[i] = pos;

        const dist = Math.abs(pos);
        if (dist < closestDist) {
            closestDist = dist;
            closestIdx = i;
        }
    }

    const prevIdx = (closestIdx - 1 + items.length) % items.length;
    const nextIdx = (closestIdx + 1) % items.length;

    for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const pos = positions[i];
        const norm = Math.max(-1, Math.min(1, pos / VW_HALF));
        const { transform, z } = transformForScreenX(pos);

        it.el.style.transform = transform;
        it.el.style.zIndex = String(1000 + Math.round(z));

        const isCore = i === closestIdx || i === prevIdx || i === nextIdx;
        const blur = isCore ? 0 : 2 * Math.pow(Math.abs(norm), 1.1);
        it.el.style.filter = `blur(${blur.toFixed(2)}px)`;

        // Active state for border
        if (i === closestIdx) it.el.classList.add('is-active');
        else it.el.classList.remove('is-active');
    }

    if (closestIdx !== -1 && closestIdx !== activeIndex) {
        setActiveVideo(closestIdx);
    }
}


// ANIMATION LOOP


function tick(t) {
    const dt = lastTime ? (t - lastTime) / 1000 : 0;
    lastTime = t;

    SCROLL_X = mod(SCROLL_X + vX * dt, TRACK);

    const decay = Math.pow(FRICTION, dt * 60);
    vX *= decay;
    if (Math.abs(vX) < 0.02) vX = 0;

    updateCarouselTransforms();
    rafId = requestAnimationFrame(tick);
}

function startCarousel() {
    cancelCarousel();
    lastTime = 0;
    rafId = requestAnimationFrame((t) => {
        updateCarouselTransforms();
        tick(t);
    });
}

function cancelCarousel() {
    if (rafId) cancelAnimationFrame(rafId);
    rafId = null;
}


function onResize() {
    const prevStep = STEP || 1;
    const ratio = SCROLL_X / (items.length * prevStep);
    measure();
    VW_HALF = window.innerWidth * 0.5;
    SCROLL_X = mod(ratio * TRACK, TRACK);
    updateCarouselTransforms();
}

stage.addEventListener('wheel', (e) => {
    if (isEntering) return;
    e.preventDefault();
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    vX += delta * WHEEL_SENS * 20;
}, { passive: false }
);

stage.addEventListener('dragstart', (e) => e.preventDefault());

let dragging = false;
let lastX = 0;
let lastT = 0;
let lastDelta = 0;
let isPointerDown = false;
let clickedCard = null;
let hasMoved = false;

stage.addEventListener('pointerdown', (e) => {
    if (isEntering) return;
    if (e.target.closest('.frame')) return;

    dragging = false;
    // We start assuming it's a click. 
    // Real dragging only starts if we move enough or immediately if we want instant drag?
    // Current logic sets dragging=true immediately on down.
    // Let's defer "dragging = true" to pointermove text, OR stick to tracking "didWeMove"

    // Better approach matching the user's request:
    clickedCard = e.target.closest('.card'); // Global variable or closed over?
    // Let's use a variable outside.

    lastX = e.clientX;
    lastT = performance.now();
    lastDelta = 0;

    // We MUST capture to track drag off-screen
    stage.setPointerCapture(e.pointerId);

    // But don't set 'dragging' flag yet? 
    // Existing code uses 'dragging' boolean to control physics.
    // Let's separate "isPointerDown" from "isDragging".
    isPointerDown = true;
    hasMoved = false;

    stage.classList.add('dragging');
});

stage.addEventListener('pointermove', (e) => {
    if (!isPointerDown) return;

    const dx = e.clientX - lastX;

    // Threshold for "drag" vs "click"
    if (Math.abs(dx) > 5) hasMoved = true;

    if (hasMoved) {
        dragging = true; // Engage physics
        const now = performance.now();
        const dt = Math.max(1, now - lastT) / 1000;

        SCROLL_X = mod(SCROLL_X - dx * DRAG_SENS, TRACK);
        lastDelta = dx / dt;
        lastX = e.clientX;
        lastT = now;
    }
});

stage.addEventListener('pointerup', (e) => {
    if (!isPointerDown) return;

    isPointerDown = false;
    stage.releasePointerCapture(e.pointerId);
    stage.classList.remove('dragging');

    if (hasMoved) {
        // Was a drag
        vX = -lastDelta * DRAG_SENS;
        dragging = false;
    } else {
        // Was a click - open showcase if clicked on a card
        // Was a click - open showcase if clicked on a card
        if (clickedCard) {
            const index = parseInt(clickedCard.dataset.index, 10);
            if (!isNaN(index) && MOVIES[index]) {
                // AUTH CHECK
                if (auth && auth.currentUser) {
                    openShowcase(MOVIES[index]);
                } else {
                    const modal = document.getElementById('signin-modal');
                    if (modal) modal.style.display = 'flex';
                }
            }
        }
    }

    clickedCard = null;
});

window.addEventListener('resize', () => {
    setTimeout(onResize, 80);
});


async function animateEntry(visibleCards) {
    await new Promise((r) => requestAnimationFrame(r));
    const tl = window.gsap.timeline();

    visibleCards.forEach(({ item, screenX }, idx) => {
        const state = { p: 0 };
        const { ry, tz, scale: baseScale } = computeTransformComponents(screenX);
        const START_SCALE = 0.92;
        const START_Y = 40;

        item.el.style.opacity = '0';
        item.el.style.transform =
            `translate3d(${screenX}px,-50%,${tz}px) ` +
            `rotateY(${ry}deg) ` +
            `scale(${START_SCALE}) ` +
            `translateY(${START_Y}px)`;

        tl.to(state, {
            p: 1,
            duration: 0.6,
            ease: 'power3.out',
            onUpdate: () => {
                const t = state.p;
                const currentScale = START_SCALE + (baseScale - START_SCALE) * t;
                const currentY = START_Y * (1 - t);
                const opacity = t;
                item.el.style.opacity = opacity.toFixed(3);

                if (t >= 0.999) {
                    const { transform } = transformForScreenX(screenX);
                    item.el.style.transform = transform;
                } else {
                    item.el.style.transform =
                        `translate3d(${screenX}px,-50%,${tz}px) ` +
                        `rotateY(${ry}deg) ` +
                        `scale(${currentScale}) ` +
                        `translateY(${currentY}px)`;
                }
            },
        }, idx * 0.05
        );
    });
    await new Promise((resolve) => { tl.eventCallback('onComplete', resolve); });
}

async function warmupCompositing() {
    const originalScrollX = SCROLL_X;
    const stepSize = STEP * 0.5;
    const numSteps = Math.ceil(TRACK / stepSize);
    for (let i = 0; i < numSteps; i++) {
        SCROLL_X = mod(originalScrollX + i * stepSize, TRACK);
        updateCarouselTransforms();
        if (i % 3 === 0) await new Promise((r) => requestAnimationFrame(r));
    }
    SCROLL_X = originalScrollX;
    updateCarouselTransforms();
    await new Promise((r) => requestAnimationFrame(r));
}

async function init() {
    await fetchMovies();
    createCards();
    createVideoBackgrounds(); // Replaces buildPalette
    measure();
    updateCarouselTransforms();
    stage.classList.add('carousel-mode');


    // Initial active video
    const half = TRACK / 2;
    let closestIdx = 0;
    let closestDist = Infinity;
    for (let i = 0; i < items.length; i++) {
        let pos = items[i].x - SCROLL_X;
        if (pos < -half) pos += TRACK;
        if (pos > half) pos -= TRACK;
        const d = Math.abs(pos);
        if (d < closestDist) {
            closestDist = d;
            closestIdx = i;
        }
    }
    setActiveVideo(closestIdx);

    await warmupCompositing();

    // Hide loader
    if (loader) loader.classList.add('loader--hide');

    // Entry Animation
    const viewportWidth = window.innerWidth;
    const visibleCards = [];
    for (let i = 0; i < items.length; i++) {
        let pos = items[i].x - SCROLL_X;
        if (pos < -half) pos += TRACK;
        if (pos > half) pos -= TRACK;
        const screenX = pos;
        if (Math.abs(screenX) < viewportWidth * 0.6) {
            visibleCards.push({ item: items[i], screenX, index: i });
        }
    }
    visibleCards.sort((a, b) => a.screenX - b.screenX);

    await animateEntry(visibleCards);
    isEntering = false;
    startCarousel();

    // Populate sections NOW that movies are loaded
    populateContinueWatching();
    populateRecommendations(null);

    // SEARCH LOGIC

    const searchInput = document.getElementById('search-input');
    const suggestionsBox = document.getElementById('search-suggestions');
    const notFoundOverlay = document.getElementById('not-found');

    if (searchInput && suggestionsBox) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            if (query.length === 0) {
                suggestionsBox.classList.remove('active');
                setTimeout(() => suggestionsBox.innerHTML = '', 300);
                return;
            }

            // Filter movies
            const matches = MOVIES.filter(m => m.title.toLowerCase().includes(query));

            if (matches.length > 0) {
                suggestionsBox.innerHTML = matches.map(m => `
                    <div class="suggestion-item" data-title="${m.title}">
                        <img src="${m.cover}" class="suggestion-poster">
                        <span>${m.title}</span>
                    </div>
                `).join('');

                suggestionsBox.classList.add('active');

                // Attach click events
                document.querySelectorAll('.suggestion-item').forEach(item => {
                    item.addEventListener('click', (ev) => {
                        ev.stopPropagation();
                        const title = item.getAttribute('data-title');
                        const movie = MOVIES.find(m => m.title === title);
                        if (movie) {
                            openShowcase(movie);
                            suggestionsBox.classList.remove('active');
                            searchInput.value = ''; // Clear search
                        }
                    });
                });
            } else {
                suggestionsBox.classList.remove('active');
            }
        });

        // Search on Enter key (Original behavior fallback)
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const query = searchInput.value.toLowerCase().trim();
                const movie = MOVIES.find(m => m.title.toLowerCase().includes(query));

                suggestionsBox.classList.remove('active');

                if (movie) {
                    openShowcase(movie);
                    populateRecommendations(movie);
                    searchInput.value = '';
                } else {
                    if (notFoundOverlay) {
                        notFoundOverlay.classList.add('active');
                        setTimeout(() => notFoundOverlay.classList.remove('active'), 2000);
                    }
                }
            }
        });

        // Close suggestions on click outside
        window.addEventListener('click', (e) => {
            if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
                suggestionsBox.classList.remove('active');
            }
        });
    }
}

init();


// RECOMMENDATIONS (Genre-based)

const recommendationsGrid = document.getElementById('recommendations-grid');
const recommendationsSection = document.getElementById('recommendations-section');

function populateRecommendations(baseMovie) {
    if (!recommendationsGrid) return;

    recommendationsGrid.innerHTML = '';

    // If no movie viewed yet, show random recommendations
    let recs = [];
    if (baseMovie && baseMovie.genre) {
        const genre = baseMovie.genre.split('/')[0].trim().toLowerCase();
        recs = MOVIES.filter(m =>
            m.title !== baseMovie.title &&
            m.genre && m.genre.toLowerCase().includes(genre)
        ).slice(0, 10);
    }

    // Fill with random movies if not enough
    if (recs.length < 10) {
        const others = MOVIES.filter(m =>
            !baseMovie || m.title !== baseMovie.title
        ).filter(m => !recs.includes(m)).slice(0, 10 - recs.length);
        recs.push(...others);
    }

    recs.forEach(m => {
        const item = document.createElement('div');
        item.className = 'recommendation-item';
        item.innerHTML = `
            <img src="${m.cover}" alt="${m.title}" class="recommendation-poster">
            <div class="recommendation-title">${m.title}</div>
        `;
        item.addEventListener('click', () => {
            openShowcase(m);
            addToContinueWatching(m);
            populateRecommendations(m);
        });
        recommendationsGrid.appendChild(item);
    });

    if (recommendationsSection) recommendationsSection.style.display = recs.length > 0 ? 'block' : 'none';
}


// CONTINUE WATCHING (LocalStorage)

const continueGrid = document.getElementById('continue-grid');
const continueSection = document.getElementById('continue-watching');
const CONTINUE_KEY = 'resonance_continue_watching';

function getContinueWatching() {
    try {
        return JSON.parse(localStorage.getItem(CONTINUE_KEY)) || [];
    } catch {
        return [];
    }
}

function addToContinueWatching(movie) {
    if (!movie) return;
    let list = getContinueWatching();
    list = list.filter(m => m.title !== movie.title);
    list.unshift({
        title: movie.title,
        cover: movie.cover,
        progress: Math.floor(Math.random() * 60) + 20
    });
    list = list.slice(0, 10);
    localStorage.setItem(CONTINUE_KEY, JSON.stringify(list));
    populateContinueWatching();
}

function populateContinueWatching() {
    if (!continueGrid) return;

    const list = getContinueWatching();
    if (list.length === 0) {
        if (continueSection) continueSection.style.display = 'none';
        return;
    }

    if (continueSection) continueSection.style.display = 'block';
    continueGrid.innerHTML = '';

    list.forEach(item => {
        const el = document.createElement('div');
        el.className = 'continue-item';
        el.innerHTML = `
            <img src="${item.cover}" alt="${item.title}" class="continue-poster">
            <div class="continue-progress">
                <div class="continue-progress-bar" style="width: ${item.progress}%"></div>
            </div>
            <div class="continue-title">${item.title}</div>
        `;
        el.addEventListener('click', () => {
            const movie = MOVIES.find(m => m.title === item.title);
            if (movie) {
                openShowcase(movie);
                populateRecommendations(movie);
            }
        });
        continueGrid.appendChild(el);
    });
}

// Note: populateContinueWatching & populateRecommendations are now called inside init() after movies load
