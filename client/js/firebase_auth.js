import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

// DOM Elements
const signinBtn = document.querySelector('.btn-signin');
const signinBtnText = document.querySelector('.btn-signin .btn-text'); // Specific text span
const loginBtn = document.querySelector('.btn-login');
const userProfile = document.querySelector('.user-profile'); // New Profile Element
const userAvatar = document.querySelector('.user-avatar');
const logoutBtn = document.querySelector('.btn-logout');

const signinModal = document.getElementById('signin-modal');
const loginModal = document.getElementById('login-modal');
const googleAuthBtn = document.getElementById('google-auth-btn');
const regularLoginBtn = document.getElementById('regular-login-btn');
const closeButtons = document.querySelectorAll('.modal-close');

let auth;
let provider;
let currentUser = null; // Track auth state globally

// Expose Auth State Helper for other scripts (like index.js)
window.isUserLoggedIn = () => {
    return currentUser !== null;
};

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

        // Listen for Auth State Changes
        onAuthStateChanged(auth, (user) => {
            currentUser = user; // Update state

            if (user) {
                console.log("User is signed in:", user.email);
                updateSignInButtonState(true);
                syncUserWithDB(user); // Sync with MySQL
            } else {
                console.log("User is signed out");
                updateSignInButtonState(false);
            }
        });

        setupProfileEvents();

    } catch (error) {
        console.error("Firebase init error:", error);
    }
}

// this shit sent user data to the mysql database, this motherfucker is a spy for us, it steal users data

async function syncUserWithDB(user) {
    try {
        await fetch('http://localhost:3000/api/auth/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                uid: user.uid,
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL
            })
        });
    } catch (err) {
        console.error("Sync Error:", err);
    }
}

function sizeButton(btn) {
    if (btn) {
        // Enforce min-width if not set via CSS, but CSS is preferred
        // btn.style.minWidth = '140px'; 
    }
}

// Function to update UI based on state
function updateSignInButtonState(isLoggedIn) {
    // 1. Update Sign In Button Text ("SIGN IN" vs "ENTER")
    if (signinBtnText) {
        signinBtnText.textContent = isLoggedIn ? "ENTER" : "SIGN IN";
    } else if (signinBtn) {
        signinBtn.textContent = isLoggedIn ? "ENTER" : "SIGN IN";
    }

    // 2. Toggle Login Button Visibility
    if (loginBtn) {
        // Logged In -> Hide Login Button
        // Logged Out -> Show Login Button
        loginBtn.style.display = isLoggedIn ? 'none' : 'flex';
    }

    // 3. Toggle User Profile Visibility
    if (userProfile) {
        userProfile.style.display = isLoggedIn ? 'flex' : 'none';

        if (isLoggedIn && currentUser && userAvatar) {
            // Update Avatar
            if (currentUser.photoURL) {
                userAvatar.src = currentUser.photoURL;
            } else {
                const initial = currentUser.email ? currentUser.email[0].toUpperCase() : 'U';
                userAvatar.src = `https://ui-avatars.com/api/?name=${initial}&background=random`;
            }
        }
    }
}

function setupProfileEvents() {
    if (userProfile && userAvatar) {
        userProfile.addEventListener('click', (e) => {
            // Toggle dropdown
            userProfile.classList.toggle('active');
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener('click', async (e) => {
            e.stopPropagation(); // Prevent re-toggling
            try {
                await signOut(auth);
                // onAuthStateChanged will handle UI updates
                window.location.reload(); // Optional: Reload to clear state
            } catch (error) {
                console.error("Logout failed:", error);
            }
        });
    }

    // Close dropdown on click outside
    window.addEventListener('click', (e) => {
        if (userProfile && !userProfile.contains(e.target)) {
            userProfile.classList.remove('active');
        }
    });
}


// Unified Event Listener for Sign In Button
if (signinBtn) {
    signinBtn.addEventListener('click', (e) => {
        e.preventDefault(); // Always prevent default anchor link

        if (currentUser) {
            // Logged In -> Go to App
            window.location.href = 'slider.html';
        } else {
            // Not Logged In -> Open Modal
            if (signinModal) signinModal.classList.add('active');
        }
    });
}

// Start initialization
initFirebase();

// ... (Rest of modal/event listeners remain same) ...

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

const googleAuthBtn2 = document.getElementById('google-auth-btn-2');

// Google Sign In Logic (Reused for both buttons)
async function handleGoogleSignIn() {
    if (!auth) {
        alert("Auth not ready yet, please wait...");
        return;
    }
    try {
        const result = await signInWithPopup(auth, provider);
        // onAuthStateChanged will handle the button update
        // We just redirect if successful for immediate feedback
        if (result.user) {
            window.location.href = 'slider.html';
        }
    } catch (error) {
        console.error("Error signing in with Google:", error);
        alert("Google Sign In Failed: " + error.message);
    }
}

if (googleAuthBtn) {
    googleAuthBtn.addEventListener('click', handleGoogleSignIn);
}

if (googleAuthBtn2) {
    googleAuthBtn2.addEventListener('click', handleGoogleSignIn);
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
                // Backend queries 'admins' table, so any success here IS an admin
                localStorage.setItem('adminToken', 'true');
                // Optional: Store the username for display
                localStorage.setItem('adminUser', username);
                window.location.href = 'admin.html';
            } else {
                alert(data.message);
            }
        } catch (err) {
            console.error(err);
            alert('Login failed. Please check server connection.');
        }
    });
}
