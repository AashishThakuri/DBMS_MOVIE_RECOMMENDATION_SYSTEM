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

// Login Handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const res = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        const data = await res.json();

        if (data.success) {
            localStorage.setItem('adminToken', 'true'); // Simple client-side check
            showDashboard();
        } else {
            loginError.textContent = data.message;
        }
    } catch (err) {
        loginError.textContent = 'Connection error';
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
    movieModal.classList.remove('hidden');
}

function closeModal() {
    movieModal.classList.add('hidden');
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

    movieModal.classList.remove('hidden');
}

// Form Submit (Add/Edit)
movieForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const id = document.getElementById('movie-id').value;
    const movieData = {
        title: document.getElementById('title').value,
        rating: document.getElementById('rating').value,
        genre: document.getElementById('genre').value,
        release_year: document.getElementById('release_year').value,
        language: document.getElementById('language').value,
        description: document.getElementById('description').value,
        poster_url: document.getElementById('poster_url').value,
        trailer_url: document.getElementById('trailer_url').value
    };

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
        } else {
            alert('Error saving movie');
        }
    } catch (err) {
        alert('Server error');
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
        } else {
            alert('Error deleting movie');
        }
    } catch (err) {
        alert('Server error');
    }
}
