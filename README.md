# Resonance - Immersive Streaming Platform

**Resonance** is a next-generation movie streaming and recommendation web application designed with a focus on immersive user experience and fluid animations. It features a stunning 3D interactive slider, real-time database integration, and a comprehensive admin management system.

![Resonance Screenshot](client/img/logo.png)

## 🚀 Key Features

### 🎥 Front-End Experience
-   **Immersive 3D Slider:** Custom-built "Gradient Slider" using **GSAP** for smooth, physics-based interactions and 3D card transformations.
-   **Dynamic Intro:** "We Create The Future" scroll-triggered zoom animation that welcomes users (plays once per session).
-   **Showcase Mode:** Detailed overlay for each movie featuring:
    -   **Trailers:** Fullscreen trailer playback.
    -   **Related Movies:** Genre-based recommendation engine.
    -   **Cast & Crew:** Detailed production info.
-   **Video Backgrounds:** Dynamic video previews that play when browsing movies.
-   **Authentication:** 
    -   Google Sign-In (via **Firebase**).
    -   Traditional Admin Login.

### 🛠️ Backend & Admin
-   **Node.js & Express API:** Robust RESTful API handling movie data and user sessions.
-   **Admin Dashboard:** Secure panel for content management:
    -   **CRUD Operations:** Add, Edit, Delete, and View movies in real-time.
    -   **Instant Updates:** Changes reflect immediately on the frontend without server restarts.
-   **Security:** 
    -   Environment variable protection.
    -   Secure firebase configuration serving.

### 🗄️ Database (MySQL)
The system is powered by a relational MySQL database structure:
-   **`movies`**: Stores metadata (title, genre, ratings, posters, trailers).
-   **`users`**: Manages registered users and Google Auth identities.
-   **`admins`**: Handles administrative access control.
-   **`ratings`**: (Planned) User rating system.

## 🛠️ Technology Stack

-   **Frontend:** HTML5, CSS3 (Custom Properties), JavaScript (ES6+), GSAP (GreenSock), Firebase SDK.
-   **Backend:** Node.js, Express.js.
-   **Database:** MySQL.
-   **Tools:** Git, Postman (for API testing).

## ⚙️ Installation & Setup

### Prerequisites
-   Node.js installed.
-   MySQL Server installed and running.

### 1. Database Setup
Run the provided SQL script to initialize the schema:
```sql
SOURCE path/to/MovieRecommendationSystem.sql;
```

### 2. Backend Setup
Navigate to the server directory and install dependencies:
```bash
cd server
npm install
```

Create a `.env` file based on `.env.example`:
```ini
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=movie_recommendation_system
# Add your Firebase Config keys here
```

Start the server:
```bash
node server.js
```

### 3. Frontend Setup
The frontend is built with vanilla technologies. You can serve it using a simple HTTP server (e.g., Live Server or Python):
```bash
cd client
python -m http.server 8000
```
Visit `http://localhost:8000` in your browser.

## 🔒 Security Note
This repository excludes sensitive configuration files (`.env`). Please ensure you set up your own environment variables and Firebase project keys locally.

---
**Developed by Aashish Thakuri** | *Resonance Streaming Platform*
