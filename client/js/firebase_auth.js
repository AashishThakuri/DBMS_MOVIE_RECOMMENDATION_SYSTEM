import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// DOM Elements
const signinBtn = document.querySelector('.btn-signin');
const loginBtn = document.querySelector('.btn-login');
const signinModal = document.getElementById('signin-modal');
const loginModal = document.getElementById('login-modal');
const googleAuthBtn = document.getElementById('google-auth-btn');
const regularLoginBtn = document.getElementById('regular-login-btn');
const closeButtons = document.querySelectorAll('.modal-close');

let auth;
let provider;

// Initialize Firebase dynamically
async function initFirebase() {
    try {
        const response = await fetch('http://localhost:3000/api/config/firebase');
        if (!response.ok) throw new Error('Failed to load Firebase config');
        const firebaseConfig = await response.json();

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        provider = new GoogleAuthProvider();

        console.log("Firebase initialized securely");
    } catch (error) {
        console.error("Firebase init error:", error);
    }
}

// Start initialization
initFirebase();

// Event Listeners for Modals
if (signinBtn) {
    signinBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Prevent default link behavior
        signinModal.classList.add('active');
    });
}

if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginModal.classList.add('active');
    });
}

// Close Modals
closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        signinModal.classList.remove('active');
        loginModal.classList.remove('active');
    });
});

window.addEventListener('click', (e) => {
    if (e.target === signinModal) signinModal.classList.remove('active');
    if (e.target === loginModal) loginModal.classList.remove('active');
});

// Google Sign In Logic
if (googleAuthBtn) {
    googleAuthBtn.addEventListener('click', async () => {
        if (!auth) {
            alert("Auth not ready yet, please wait...");
            return;
        }
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            console.log("User signed in with Google:", user.email);



            // On success, redirect to slider page
            window.location.href = 'slider.html';
        } catch (error) {
            console.error("Error signing in with Google:", error);
            alert("Google Sign In Failed: " + error.message);
        }
    });
}

// Regular Login Logic (Admin or User)
if (regularLoginBtn) {
    regularLoginBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;

        try {
            const res = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await res.json();

            if (data.success) {
                // If it's the admin, go to admin dashboard
                if (username === 'admin') {
                    // Set the token so admin.html knows we are logged in
                    localStorage.setItem('adminToken', 'true');
                    window.location.href = 'admin.html';
                } else {
                    alert('Login successful');
                }
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Login failed. Please check server connection.');
        }
    });
}
