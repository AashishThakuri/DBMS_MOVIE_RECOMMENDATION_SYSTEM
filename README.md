# Streaming Website "Resonance"

## Project Overview
This project is a relational database backend designed to power a **Movie Recommendation System**. It manages a library of movies, user ratings, and administrative controls. The system features built-in logic (Stored Procedures) to handle rating updates and generate content-based recommendations by genre.

## Database Schema

The system uses **MySQL** and consists of the following core tables:

### 1. movies
The central catalog of films.
* **Columns:** `movie_id`, `title`, `genre`, `release_year`, `rating` (IMDb/External), `language`, `description`, `poster_url`, `trailer_url`.
* **Features:** Stores metadata for displaying movie details and "Watch Trailer" links.

### 2. ratings
Links users to movies with a score (1-5).
* **Columns:** `rating_id`, `user_id`, `movie_id`, `rating`, `rated_at`.
* **Constraints:** `UNIQUE(user_id, movie_id)` prevents duplicate ratings for the same movie by the same user.
* **Triggers:** Automatically updates the timestamp on rating changes.

### 3. admins
Manages system access for content moderators.
* **Columns:** `admin_id`, `username`, `password`.

### 4. users (Dependency)
* **Note:** This table is referenced by `ratings` but must be created before setting up the ratings table. It stores user credentials and profile info.

---
### 5. ER - Diagram
<img width="3136" height="5256" alt="Untitled diagram-2026-02-01-105953" src="https://github.com/user-attachments/assets/518eb506-be85-451a-a2ec-d5d2bf299900" />


## Features & Stored Procedures

The database includes pre-compiled SQL procedures for efficient data handling:

| Procedure | Functionality |
| :--- | :--- |
| **rate_movie** | Handles "Upsert" logic: Inserts a new rating or updates an existing one if the user has already rated the movie. |
| **recommend_movies_by_genre** | The core recommendation engine. It suggests movies sharing a specific genre, excluding the one currently being viewed, sorted by rating and randomized for variety. |
| **add_movie** | A helper procedure for admins to insert new movie metadata quickly. |

---

## Setup & Installation

### Prerequisites
* MySQL Server (8.0+)
* MySQL Workbench or any SQL Client

### Step 1: Create the Database
Run the provided SQL script. **Important:** Ensure you create the `users` table before the `ratings` table to satisfy foreign key constraints.

```sql
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100),
    email VARCHAR(100) UNIQUE
);
