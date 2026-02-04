const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD, // Make sure to set this in .env
    database: process.env.DB_NAME || 'movie_recommendation_system',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Test Connection
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Database connection failed:', err);
    } else {
        console.log('Connected to MySQL database');
        connection.release();
    }
});

// API Endpoints

// Get all movies
app.get('/api/movies', (req, res) => {
    const query = 'SELECT * FROM movies';
    pool.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching movies:', err);
            res.status(500).json({ error: 'Database error' });
            return;
        }
        res.json(results);
    });
});

// Get recent ratings (Continue Watching simulation)
// Note: In a real app this would filter by user_id
app.get('/api/continue-watching', (req, res) => {
    // Assuming ratings table stores viewing history for now, or just returning random/recent logic
    // For now, we'll just mock it or query the ratings table if it has history
    // Since schema showed ratings, let's just return nothing or placeholder if table structure isn't perfect for history
    res.json([]);
});

// ADMIN API ENDPOINTS



// 0.5. Get Firebase Config
app.get('/api/config/firebase', (req, res) => {
    res.json({
        apiKey: process.env.FIREBASE_API_KEY,
        authDomain: process.env.FIREBASE_AUTH_DOMAIN,
        projectId: process.env.FIREBASE_PROJECT_ID,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.FIREBASE_APP_ID,
        measurementId: process.env.FIREBASE_MEASUREMENT_ID
    });
});

// 1. Login
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    // Simple query (In production, use hashed passwords!)
    console.log(`[Login Attempt] Username: '${username}', Password: '${password}'`);

    const query = 'SELECT * FROM admins WHERE username = ? AND password = ?';
    pool.query(query, [username, password], (err, results) => {
        if (err) {
            console.error('[Login Error] Database error:', err);
            return res.status(500).json({ error: 'Database error' });
        }

        console.log(`[Login Result] Found users: ${results.length}`);

        if (results.length > 0) {
            res.json({ success: true, message: 'Login successful' });
        } else {
            console.warn('[Login Failed] Invalid credentials or user not found');
            res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
    });
});

// 2. Add Movie
app.post('/api/movies', (req, res) => {
    const { title, genre, release_year, language, rating, description, poster_url, trailer_url } = req.body;
    console.log(`[Admin] Adding new movie: ${title}`);
    const query = 'INSERT INTO movies (title, genre, release_year, language, rating, description, poster_url, trailer_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    pool.query(query, [title, genre, release_year, language, rating, description, poster_url, trailer_url], (err, result) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to add movie' });
        }
        console.log(`[Admin] Movie added successfully with ID: ${result.insertId}`);
        res.json({ success: true, message: 'Movie added', id: result.insertId });
    });
});

// 3. Update Movie
app.put('/api/movies/:id', (req, res) => {
    const { id } = req.params;
    const { title, genre, release_year, language, rating, description, poster_url, trailer_url } = req.body;
    console.log(`[Admin] Updating movie ID ${id}: ${title}`);
    const query = 'UPDATE movies SET title=?, genre=?, release_year=?, language=?, rating=?, description=?, poster_url=?, trailer_url=? WHERE movie_id=?';
    pool.query(query, [title, genre, release_year, language, rating, description, poster_url, trailer_url, id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to update movie' });
        console.log(`[Admin] Movie ID ${id} updated successfully`);
        res.json({ success: true, message: 'Movie updated' });
    });
});

// 4. Delete Movie
app.delete('/api/movies/:id', (req, res) => {
    const { id } = req.params;
    console.log(`[Admin] Deleting movie ID: ${id}`);
    const query = 'DELETE FROM movies WHERE movie_id = ?';
    pool.query(query, [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Failed to delete movie' });
        console.log(`[Admin] Movie ID ${id} deleted successfully`);
        res.json({ success: true, message: 'Movie deleted' });
    });
});

// 5. Sync Google User
app.post('/api/auth/sync', (req, res) => {
    const { uid, email, displayName, photoURL } = req.body;

    if (!uid || !email) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate a username from display name or email if not provided
    const username = displayName || email.split('@')[0];

    const query = `
        INSERT INTO users (google_uid, email, username, display_name, profile_picture) 
        VALUES (?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        display_name = VALUES(display_name), 
        profile_picture = VALUES(profile_picture),
        last_login = CURRENT_TIMESTAMP
    `;

    pool.query(query, [uid, email, username, displayName, photoURL], (err, result) => {
        if (err) {
            console.error('[Auth Sync] Database error:', err);
            return res.status(500).json({ error: 'Database sync failed' });
        }
        res.json({ success: true, message: 'User synced successfully' });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
