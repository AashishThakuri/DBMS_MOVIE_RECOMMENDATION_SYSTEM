const API_URL = 'http://localhost:3000/api';

// DOM Elements
const loginSection = document.getElementById('login-section');
const dashboardSection = document.getElementById('dashboard-section');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const moviesContainer = document.getElementById('movies-container');
const movieModal = document.getElementById('movie-modal');
const movieForm = document.getElementById('movie-form');
const modalTitle = document.getElementById('modal-title');

// State
let allMovies = [];
let currentMovieState = null;

// Login Handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!username || !password) {
        loginError.textContent = 'Please fill in all fields';
        return;
    }

    try {
        console.log(`Sending login request for: ${username}`);
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        console.log('Login response:', data);

        if (res.ok && data.success) {
            localStorage.setItem('adminToken', 'true');
            showDashboard();
        } else {
            localStorage.removeItem('adminToken'); // Clear any stale token
            loginError.textContent = data.message || 'Login failed';
        }
    } catch (err) {
        console.error('Login exception:', err);
        loginError.textContent = 'Connection error: ' + err.message;
    }
});

function showDashboard() {
    loginSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    loadMovies();
}

function logout() {
    localStorage.removeItem('adminToken');
    window.location.reload();
}

// Check Login on Load
if (localStorage.getItem('adminToken')) {
    showDashboard();
}

// Load Movies
async function loadMovies() {
    try {
        const res = await fetch(`${API_URL}/movies`);
        allMovies = await res.json();
        renderMovies(allMovies);
    } catch (err) {
        console.error(err);
    }
}

// Render Movies
function renderMovies(movies) {
    moviesContainer.innerHTML = movies.map(movie => `
        <div class="movie-item">
            <img src="${movie.poster_url}" alt="${movie.title}" onerror="this.src='images/default_cover.jpg'">
            <div class="movie-info">
                <h3>${movie.title} (${movie.release_year})</h3>
                <p>${movie.rating} | ${movie.genre}</p>
            </div>
            <div class="movie-actions">
                <button class="btn-edit" onclick="openEditModal(${movie.movie_id})">Edit</button>
                <button class="btn-delete" onclick="deleteMovie(${movie.movie_id})">Delete</button>
            </div>
        </div>
    `).join('');
}

// Modal Logic
function openModal() {
    modalTitle.textContent = 'Add New Movie';
    movieForm.reset();
    document.getElementById('movie-id').value = '';
    currentMovieState = null;
    movieModal.classList.remove('hidden');
}

function closeModal() {
    movieModal.classList.add('hidden');
    currentMovieState = null;
}

function openEditModal(id) {
    const movie = allMovies.find(m => m.movie_id === id);
    if (!movie) return;

    modalTitle.textContent = 'Edit Movie';
    document.getElementById('movie-id').value = movie.movie_id;
    document.getElementById('title').value = movie.title;
    document.getElementById('rating').value = movie.rating;
    document.getElementById('genre').value = movie.genre;
    document.getElementById('release_year').value = movie.release_year;
    document.getElementById('language').value = movie.language;
    document.getElementById('description').value = movie.description;
    document.getElementById('poster_url').value = movie.poster_url;
    document.getElementById('trailer_url').value = movie.trailer_url;

    currentMovieState = { ...movie }; // Capture state

    movieModal.classList.remove('hidden');
}

// Toast Helper
function showToast(message, type = 'success') {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span>`;

    container.appendChild(toast);

    // Remove from DOM after animation (3s total)
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Form Submit (Add/Edit)
movieForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('movie-id').value;
    const ratingVal = parseFloat(document.getElementById('rating').value);
    const yearVal = parseInt(document.getElementById('release_year').value);

    // Validation
    if (isNaN(ratingVal) || ratingVal < 0 || ratingVal > 10) {
        showToast("Please enter a valid rating (0-10)", 'error');
        return;
    }
    if (isNaN(yearVal) || yearVal < 1880 || yearVal > 2100) {
        showToast("Please enter a valid release year", 'error');
        return;
    }

    const movieData = {
        title: document.getElementById('title').value,
        rating: ratingVal,
        genre: document.getElementById('genre').value,
        release_year: yearVal,
        language: document.getElementById('language').value,
        description: document.getElementById('description').value,
        poster_url: document.getElementById('poster_url').value,
        trailer_url: document.getElementById('trailer_url').value
    };

    // Check availability of changes (Only for Edit Mode)
    if (id && currentMovieState) {
        // Loose comparison for numbers to avoid type mismatch (string vs number)
        const isChanged =
            movieData.title !== currentMovieState.title ||
            movieData.rating != currentMovieState.rating ||
            movieData.genre !== currentMovieState.genre ||
            movieData.release_year != currentMovieState.release_year ||
            movieData.language !== currentMovieState.language ||
            movieData.description !== currentMovieState.description ||
            movieData.poster_url !== currentMovieState.poster_url ||
            movieData.trailer_url !== currentMovieState.trailer_url;

        if (!isChanged) {
            closeModal();
            return; // EXIT HERE -> No Notification
        }
    }

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/movies/${id}` : `${API_URL}/movies`;

    try {
        const res = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(movieData)
        });
        const data = await res.json();

        if (data.success) {
            closeModal();
            loadMovies();
            showToast(id ? 'Movie updated successfully' : 'Movie added successfully', 'success');
        } else {
            showToast(data.message || 'Error saving movie', 'error');
        }
    } catch (err) {
        showToast('Server connection error', 'error');
    }
});

// Delete Movie
async function deleteMovie(id) {
    if (!confirm('Are you sure you want to delete this movie?')) return;

    try {
        const res = await fetch(`${API_URL}/movies/${id}`, { method: 'DELETE' });
        const data = await res.json();

        if (data.success) {
            loadMovies();
            showToast('Movie deleted successfully', 'success');
        } else {
            showToast('Error deleting movie', 'error');
        }
    } catch (err) {
        showToast('Server connection error', 'error');
    }
}
