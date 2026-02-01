CREATE DATABASE movie_recommendation_system;
USE movie_recommendation_system;

-- ==========================================
-- 1) USERS 
-- ==========================================
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    firebase_uid VARCHAR(128) UNIQUE NOT NULL,
    username VARCHAR(50),
    email VARCHAR(100),
    auth_provider ENUM('password','google') NOT NULL DEFAULT 'password',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ==========================================
-- 2) MOVIES 
-- ==========================================
CREATE TABLE movies (     								
    movie_id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NOT NULL,
    genre VARCHAR(80),
    release_year INT,
    poster_url VARCHAR(255),
    language VARCHAR(40),
    rating DECIMAL(2,1) DEFAULT 0.0
);

-- ==========================================
-- 3) RATINGS 
-- ==========================================
CREATE TABLE ratings (
    rating_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    movie_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    rated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ratings_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT fk_ratings_movie
        FOREIGN KEY (movie_id) REFERENCES movies(movie_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE,

    CONSTRAINT uq_user_movie UNIQUE (user_id, movie_id)
);

-- ==========================================
-- 4) AUTH SESSIONS 
-- ==========================================
CREATE TABLE auth_sessions (
    session_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    login_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    logout_time TIMESTAMP NULL,
    device_info VARCHAR(200),

    CONSTRAINT fk_sessions_user
        FOREIGN KEY (user_id) REFERENCES users(user_id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- ==========================================
-- ADMIN table 
-- ==========================================

CREATE TABLE ADMINS (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    firebase_uid VARCHAR(255) NOT NULL UNIQUE,
    admin_name VARCHAR(100),
    email VARCHAR(255) UNIQUE,
    role VARCHAR(50),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_login DATETIME
);

-- ==========================================
-- Indexes for faster recommendations
-- ==========================================
CREATE INDEX idx_movies_genre ON movies(genre);
CREATE INDEX idx_ratings_user ON ratings(user_id);
CREATE INDEX idx_ratings_movie ON ratings(movie_id);

INSERT INTO movies  VALUES
(1,'Troy', 'Action, Drama', 2004,'posters/1.jpeg', 'English', 7.3),
(2,'Pablo Escobar: The Drug Lord', 'Biography, Crime, Drama', 2012,'posters/2.jpeg', 'Spanish', 8.4),
(3,'F1', 'Action, Sport', 2025,'posters/3.jpeg', 'English', 0.0), 
(4,'Ford v Ferrari', 'Action, Biography, Drama', 2019,'posters/4.jpeg', 'English', 8.1),
(5,'The Prestige', 'Drama, Mystery, Sci-Fi', 2006,'posters/5.jpeg', 'English', 8.5),
(6,'S/O Satyamurthy', 'Action, Comedy, Drama', 2015,'posters/6.jpeg', 'Telugu', 7.1),
(7,'Main Hoon Lucky The Racer', 'Action, Comedy', 2014,'posters/7.jpeg', 'Telugu', 7.2),
(8,'Shutter Island', 'Mystery, Thriller', 2010,'posters/8.jpeg', 'English', 8.2),
(9,'Inglourious Basterds', 'Adventure, Drama, War', 2009,'posters/9.jpeg', 'English', 8.4),
(10,'Ne Zha 2', 'Animation, Action, Fantasy', 2025,'posters/10.webp', 'Mandarin', 7.9),
(11,'Hell\'s Paradise', 'Animation, Action, Adventure', 2023,'posters/11.jpeg', 'Japanese', 8.2),
(12,'Grave of the Fireflies', 'Animation, Drama, War', 1988,'posters/12.jpeg', 'Japanese', 8.5),
(13,'I Want to Eat Your Pancreas', 'Animation, Drama, Romance', 2018,'posters/13.jpeg', 'Japanese', 8.0),
(14,'American Psycho', 'Crime, Drama, Horror', 2000,'posters/14.webp', 'English', 7.6),
(15,'Unko Sweater', 'Drama, Romance', 2025,'posters/15.webp', 'Nepali', 9.5),
(16,'Game of Thrones', 'Action, Adventure, Drama', 2011,'posters/16.jpeg', 'English', 9.2),
(17,'Suits', 'Comedy, Drama', 2011,'posters/17.jpeg', 'English', 8.4),
(18,'Breaking Bad', 'Crime, Drama, Thriller', 2008,'posters/18.avif', 'English', 9.5),
(19,'The Substance', 'Drama, Horror', 2024, 'posters/19.webp','English', 7.1),
(20,'The Wolf of Wall Street', 'Biography, Comedy, Crime', 2013,'posters/20.jpeg', 'English', 8.2),
(21,'True Detective', 'Crime, Drama, Mystery', 2014,'posters/21.jpeg', 'English', 8.9),
(22,'Interstellar', 'Adventure, Drama, Sci-Fi', 2014,'posters/22.jpeg', 'English', 8.7),
(23,'Inception', 'Action, Adventure, Sci-Fi', 2010,'posters/23.jpeg', 'English', 8.8),
(24,'Memories of Murder', 'Crime, Drama, Mystery', 2003,'posters/24.webp', 'Korean', 8.1),
(25,'Her', 'Drama, Romance, Sci-Fi', 2013,'posters/25.jpeg', 'English', 8.0),
(26,'Dead Poets Society', 'Comedy, Drama', 1989,'posters/26.webp', 'English', 8.1),
(27,'Hannibal', 'Crime, Drama, Horror', 2013,'posters/27.jpeg', 'English', 8.5),
(28,'Parasite', 'Drama, Thriller', 2019, 'posters/28.jpeg','Korean', 8.5);


INSERT INTO users (user_id, firebase_uid, username, email, auth_provider, created_at) VALUES
(1, 'fbu_7Qm2cK1pV8zN3xA0tY9rL5sH2dJ6', 'Samman',  'samman.kc@gmail.com',      'google',   '2025-01-05 09:12:33'),
(2, 'fbu_1nP9vR4tX6mL0aB8qC3sZ7kD2uW5', 'Aashish', 'aashish.shrestha@gmail.com','password', '2025-01-09 18:45:10'),
(3, 'fbu_5dT8hJ2kM9wQ1eR7yU3pN6vX0cL4', 'Supreme', 'supreme.adhikari@gmail.com','google',   '2025-01-12 11:06:02'),
(4, 'fbu_3xB6nC0vA8mK2pQ9tR1yU7zH5dJ4', 'Kritesh', 'kritesh.thapa@gmail.com',   'password', '2025-01-14 20:22:41'),
(5, 'fbu_9kL1sH7dJ4pV2nC6xB0mQ8tR3yU5', 'Nisha',   'nisha.karki@gmail.com',     'google',   '2025-01-20 08:30:15'),
(6, 'fbu_2pQ8tR3yU5nC6xB0mK9kL1sH7dJ4', 'Rohan',   'rohan.paudel@gmail.com',    'password', '2025-01-23 14:17:59');

-- ==========================================
-- INSERTS: ADMINS
-- ==========================================
INSERT INTO ADMINS (admin_id, firebase_uid, admin_name, email, role, created_at, last_login) VALUES
(1, 'adm_4vK2pQ9tR1yU7zH5dJ4xB6nC0vA8m', 'Admin Sagar', 'admin.sagar@mrs.com', 'super_admin', '2025-01-01 10:00:00', '2026-01-29 09:14:03'),
(2, 'adm_7Qm2cK1pV8zN3xA0tY9rL5sH2dJ6nP9', 'Admin Riya',  'admin.riya@mrs.com',  'content_admin','2025-01-03 15:25:40', '2026-01-28 18:40:12');

-- ==========================================
-- INSERTS: RATINGS  (make sure movie_id exists: 1–28)
-- UNIQUE(user_id, movie_id) is respected (no duplicates)
-- ==========================================
INSERT INTO ratings (rating_id, user_id, movie_id, rating, rated_at) VALUES
-- Samman (1)
(1,  1, 1, 4, '2026-01-05 20:12:10'),
(2,  1, 4, 5, '2026-01-06 21:05:44'),
(3,  1, 5, 5, '2026-01-07 22:40:12'),
(4,  1, 8, 5, '2026-01-09 19:15:08'),
(5,  1, 16,5, '2026-01-12 23:11:50'),
(6,  1, 18,5, '2026-01-13 22:02:33'),
(7,  1, 22,5, '2026-01-15 20:29:17'),
(8,  1, 23,5, '2026-01-16 21:41:59'),

-- Aashish (2)
(9,  2, 1, 5, '2026-01-06 18:10:00'),
(10, 2, 2, 4, '2026-01-07 18:33:12'),
(11, 2, 9, 5, '2026-01-10 20:12:35'),
(12, 2, 12,5, '2026-01-11 21:08:49'),
(13, 2, 17,5, '2026-01-14 19:54:27'),
(14, 2, 20,5, '2026-01-17 22:16:05'),
(15, 2, 24,5, '2026-01-18 21:45:41'),
(16, 2, 28,5, '2026-01-19 23:01:22'),

-- Supreme (3)
(17, 3, 3, 5, '2026-01-08 17:05:10'),
(18, 3, 7, 5, '2026-01-09 17:55:44'),
(19, 3, 9, 5, '2026-01-11 20:31:20'),
(20, 3, 11,5, '2026-01-12 19:44:55'),
(21, 3, 19,5, '2026-01-16 22:22:18'),
(22, 3, 21,5, '2026-01-17 21:33:33'),
(23, 3, 25,3, '2026-01-20 18:15:07'),
(24, 3, 27,5, '2026-01-22 23:10:49'),

-- Kritesh (4)
(25, 4, 2, 5, '2026-01-06 22:03:14'),
(26, 4, 4, 5, '2026-01-08 20:40:09'),
(27, 4, 13,5, '2026-01-12 21:17:11'),
(28, 4, 14,5, '2026-01-13 19:05:44'),
(29, 4, 16,5, '2026-01-15 23:58:08'),
(30, 4, 18,5, '2026-01-16 22:46:30'),
(31, 4, 22,5, '2026-01-19 20:11:55'),
(32, 4, 23,5, '2026-01-21 21:39:26'),

-- Nisha (5)
(33, 5, 12,5, '2026-01-10 16:22:10'),
(34, 5, 13,5, '2026-01-11 16:55:33'),
(35, 5, 25,4, '2026-01-14 18:02:19'),
(36, 5, 26,5, '2026-01-15 18:45:07'),
(37, 5, 28,5, '2026-01-18 19:10:41'),

-- Rohan (6)
(38, 6, 6,  4, '2026-01-09 13:11:10'),
(39, 6, 7,  4, '2026-01-10 14:42:31'),
(40, 6, 17, 4, '2026-01-13 20:30:00'),
(41, 6, 20, 5, '2026-01-14 21:05:21'),
(42, 6, 22, 5, '2026-01-16 22:12:48');

-- ==========================================
-- INSERTS: AUTH SESSIONS
-- ==========================================
INSERT INTO auth_sessions (session_id, user_id, login_time, logout_time, device_info) VALUES
(1,  1, '2026-01-25 19:10:02', '2026-01-25 21:45:33', 'Chrome 144 | Windows 10 | Kathmandu'),
(2,  1, '2026-01-28 20:05:11', '2026-01-28 22:20:49', 'Android App | Samsung A52 | Pokhara'),

(3,  2, '2026-01-26 18:44:07', '2026-01-26 19:55:12', 'Chrome 143 | Windows 11 | Lalitpur'),
(4,  2, '2026-01-29 21:12:40', NULL,                'iOS App | iPhone 13 | Kathmandu'),

(5,  3, '2026-01-24 16:02:55', '2026-01-24 17:10:20', 'Android App | Pixel 6a | Bharatpur'),
(6,  3, '2026-01-27 22:30:18', '2026-01-27 23:40:01', 'Firefox | Windows 10 | Kathmandu'),

(7,  4, '2026-01-23 20:18:44', '2026-01-23 21:59:09', 'Chrome | MacOS | Kathmandu'),
(8,  4, '2026-01-30 19:05:33', '2026-01-30 20:35:14', 'Android App | OnePlus | Dharan'),

(9,  5, '2026-01-22 08:40:10', '2026-01-22 09:20:55', 'Safari | iPad | Kathmandu'),
(10, 6, '2026-01-21 14:12:01', '2026-01-21 15:05:46', 'Chrome | Windows 10 | Butwal');

-- Quick checks
SELECT * FROM users;
SELECT * FROM admins;
SELECT * FROM ratings;
SELECT * FROM auth_sessions;



-- CRUD 

USE movie_recommendation_system;

DELIMITER $$

-- =========================================================
-- USER ACTIONS
-- 1) Sign in (creates a session)
-- 2) Sign out (updates session logout_time)
-- 3) Rate a movie (insert or update rating)
-- =========================================================

CREATE PROCEDURE user_sign_in(
    IN p_user_id INT,
    IN p_device_info VARCHAR(200)
)
BEGIN
    INSERT INTO auth_sessions (user_id, device_info)
    VALUES (p_user_id, p_device_info);
    
    -- return the session created (useful for backend)
    SELECT LAST_INSERT_ID() AS session_id;
END$$


CREATE PROCEDURE user_sign_out(
    IN p_session_id INT
)
BEGIN
    UPDATE auth_sessions
    SET logout_time = CURRENT_TIMESTAMP
    WHERE session_id = p_session_id;
END$$


-- User rates a movie (because UNIQUE(user_id, movie_id) exists)
-- If rating exists → UPDATE it
-- If rating doesn’t exist → INSERT it
CREATE PROCEDURE user_rate_movie(
    IN p_user_id INT,
    IN p_movie_id INT,
    IN p_rating INT
)
BEGIN
    INSERT INTO ratings (user_id, movie_id, rating)
    VALUES (p_user_id, p_movie_id, p_rating)
    ON DUPLICATE KEY UPDATE
        rating = VALUES(rating),
        rated_at = CURRENT_TIMESTAMP;
END$$


-- =========================================================
-- ADMIN ACTIONS (Movies + Ratings only)
-- Admin: Add / Update / Delete movies
-- Admin: Delete ratings or update rating if needed
-- =========================================================

-- MOVIES: Create
CREATE PROCEDURE admin_add_movie(
    IN p_title VARCHAR(150),
    IN p_genre VARCHAR(80),
    IN p_release_year INT,
    IN p_poster_url VARCHAR(255),
    IN p_language VARCHAR(40),
    IN p_rating DECIMAL(2,1)
)
BEGIN
    INSERT INTO movies (title, genre, release_year, poster_url, language, rating)
    VALUES (p_title, p_genre, p_release_year, p_poster_url, p_language, p_rating);
END$$


-- MOVIES: Read (admin view list)
CREATE PROCEDURE admin_get_all_movies()
BEGIN
    SELECT * FROM movies ORDER BY release_year DESC, rating DESC;
END$$


-- MOVIES: Update
CREATE PROCEDURE admin_update_movie(
    IN p_movie_id INT,
    IN p_title VARCHAR(150),
    IN p_genre VARCHAR(80),
    IN p_release_year INT,
    IN p_poster_url VARCHAR(255),
    IN p_language VARCHAR(40),
    IN p_rating DECIMAL(2,1)
)
BEGIN
    UPDATE movies
    SET title = p_title,
        genre = p_genre,
        release_year = p_release_year,
        poster_url = p_poster_url,
        language = p_language,
        rating = p_rating
    WHERE movie_id = p_movie_id;
END$$


-- MOVIES: Delete
CREATE PROCEDURE admin_delete_movie(
    IN p_movie_id INT
)
BEGIN
    -- ratings will auto-delete because FK has ON DELETE CASCADE
    DELETE FROM movies WHERE movie_id = p_movie_id;
END$$


-- RATINGS: Admin Read (view all ratings)
CREATE PROCEDURE admin_get_all_ratings()
BEGIN
    SELECT 
        r.rating_id, r.user_id, u.username,
        r.movie_id, m.title,
        r.rating, r.rated_at
    FROM ratings r
    JOIN users u ON u.user_id = r.user_id
    JOIN movies m ON m.movie_id = r.movie_id
    ORDER BY r.rated_at DESC;
END$$


-- RATINGS: Admin Update (moderation)
CREATE PROCEDURE admin_update_rating(
    IN p_rating_id INT,
    IN p_new_rating INT
)
BEGIN
    UPDATE ratings
    SET rating = p_new_rating,
        rated_at = CURRENT_TIMESTAMP
    WHERE rating_id = p_rating_id;
END$$


-- RATINGS: Admin Delete (moderation)
CREATE PROCEDURE admin_delete_rating(
    IN p_rating_id INT
)
BEGIN
    DELETE FROM ratings WHERE rating_id = p_rating_id;
END$$

DELIMITER ;

```-- =========================================================
-- FINAL RECOMMENDATION PROCEDURE (genre-aware + collaborative)
-- Works on your current schema (no new tables).
-- Requires MySQL 8.0+ because it uses JSON_TABLE.
-- =========================================================

-- Optional but recommended indexes
CREATE INDEX IF NOT EXISTS idx_ratings_user_movie ON ratings(user_id, movie_id);
CREATE INDEX IF NOT EXISTS idx_ratings_movie_user ON ratings(movie_id, user_id);
CREATE INDEX IF NOT EXISTS idx_ratings_rated_at   ON ratings(rated_at);

DELIMITER $$

DROP PROCEDURE IF EXISTS get_user_recommendations $$
CREATE PROCEDURE get_user_recommendations(
    IN p_user_id INT,
    IN p_limit INT
)
BEGIN
    -- tune this: higher = stronger genre preference
    DECLARE v_genre_weight DECIMAL(6,3) DEFAULT 0.150;

    DROP TEMPORARY TABLE IF EXISTS tmp_recs;

    CREATE TEMPORARY TABLE tmp_recs (
        movie_id INT PRIMARY KEY,
        score DECIMAL(8,3),
        reason VARCHAR(30)
    );

    ----------------------------------------------------------------
    -- 1) Personalized: Collaborative filtering + Genre bonus
    ----------------------------------------------------------------
    INSERT INTO tmp_recs (movie_id, score, reason)
    WITH
    user_genres AS (
        -- User’s favorite genres from movies they rated highly (>=4)
        SELECT
            TRIM(jt.genre) AS genre,
            COUNT(*) AS cnt
        FROM ratings r
        JOIN movies m ON m.movie_id = r.movie_id
        JOIN JSON_TABLE(
            CONCAT('["', REPLACE(m.genre, ',', '","'), '"]'),
            '$[*]' COLUMNS (genre VARCHAR(80) PATH '$')
        ) jt
        WHERE r.user_id = p_user_id AND r.rating >= 4
        GROUP BY TRIM(jt.genre)
    ),
    liked AS (
        SELECT movie_id, rating
        FROM ratings
        WHERE user_id = p_user_id AND rating >= 4
    ),
    neighbors AS (
        -- Similar users = overlap on liked movies; sim_score weights closeness of ratings
        SELECT
            r.user_id AS other_user_id,
            SUM(5 - ABS(r.rating - l.rating)) AS sim_score,
            COUNT(*) AS overlap
        FROM liked l
        JOIN ratings r
          ON r.movie_id = l.movie_id
         AND r.user_id <> p_user_id
        GROUP BY r.user_id
        HAVING overlap >= 2
    ),
    candidates AS (
        -- Predict ratings for movies user hasn’t rated
        SELECT
            r.movie_id,
            SUM(n.sim_score * r.rating) / NULLIF(SUM(n.sim_score), 0) AS predicted_rating,
            SUM(n.sim_score) AS support
        FROM neighbors n
        JOIN ratings r ON r.user_id = n.other_user_id
        LEFT JOIN ratings my
          ON my.user_id = p_user_id AND my.movie_id = r.movie_id
        WHERE my.rating_id IS NULL
        GROUP BY r.movie_id
    ),
    candidate_genre_bonus AS (
        -- Genre bonus = how much candidate’s genres overlap with user’s favorite genres
        SELECT
            c.movie_id,
            COALESCE(SUM(ug.cnt), 0) AS genre_bonus
        FROM candidates c
        JOIN movies m ON m.movie_id = c.movie_id
        JOIN JSON_TABLE(
            CONCAT('["', REPLACE(m.genre, ',', '","'), '"]'),
            '$[*]' COLUMNS (genre VARCHAR(80) PATH '$')
        ) jt
        LEFT JOIN user_genres ug
          ON ug.genre = TRIM(jt.genre)
        GROUP BY c.movie_id
    )
    SELECT
        c.movie_id,
        (c.predicted_rating + v_genre_weight * gb.genre_bonus) AS score,
        'collab_genre' AS reason
    FROM candidates c
    JOIN candidate_genre_bonus gb ON gb.movie_id = c.movie_id
    ORDER BY score DESC, c.support DESC
    LIMIT p_limit;

    ----------------------------------------------------------------
    -- 2) Fallback: Popular + Genre bonus (if no personalized found)
    ----------------------------------------------------------------
    IF (SELECT COUNT(*) FROM tmp_recs) = 0 THEN

        INSERT INTO tmp_recs (movie_id, score, reason)
        WITH
        user_genres AS (
            SELECT
                TRIM(jt.genre) AS genre,
                COUNT(*) AS cnt
            FROM ratings r
            JOIN movies m ON m.movie_id = r.movie_id
            JOIN JSON_TABLE(
                CONCAT('["', REPLACE(m.genre, ',', '","'), '"]'),
                '$[*]' COLUMNS (genre VARCHAR(80) PATH '$')
            ) jt
            WHERE r.user_id = p_user_id AND r.rating >= 4
            GROUP BY TRIM(jt.genre)
        ),
        unseen AS (
            SELECT m.*
            FROM movies m
            LEFT JOIN ratings my
              ON my.user_id = p_user_id AND my.movie_id = m.movie_id
            WHERE my.rating_id IS NULL
        ),
        unseen_genre_bonus AS (
            SELECT
                u.movie_id,
                COALESCE(SUM(ug.cnt), 0) AS genre_bonus
            FROM unseen u
            JOIN JSON_TABLE(
                CONCAT('["', REPLACE(u.genre, ',', '","'), '"]'),
                '$[*]' COLUMNS (genre VARCHAR(80) PATH '$')
            ) jt
            LEFT JOIN user_genres ug
              ON ug.genre = TRIM(jt.genre)
            GROUP BY u.movie_id
        ),
        popularity AS (
            SELECT
                u.movie_id,
                COALESCE(AVG(r.rating), 0) AS avg_user_rating,
                COUNT(r.rating_id) AS rating_count,
                u.rating AS catalog_rating
            FROM unseen u
            LEFT JOIN ratings r ON r.movie_id = u.movie_id
            GROUP BY u.movie_id, u.rating
        )
        SELECT
            p.movie_id,
            (
                p.avg_user_rating
                + (p.catalog_rating / 2.0)
                + v_genre_weight * gb.genre_bonus
            ) AS score,
            'popular_genre' AS reason
        FROM popularity p
        JOIN unseen_genre_bonus gb ON gb.movie_id = p.movie_id
        ORDER BY score DESC, p.rating_count DESC, p.catalog_rating DESC
        LIMIT p_limit;

    END IF;

    ----------------------------------------------------------------
    -- Final output
    ----------------------------------------------------------------
    SELECT
        m.movie_id, m.title, m.genre, m.release_year, m.language, m.poster_url,
        ROUND(t.score, 2) AS score,
        t.reason
    FROM tmp_recs t
    JOIN movies m ON m.movie_id = t.movie_id
    ORDER BY t.score DESC, m.rating DESC
    LIMIT p_limit;

END $$

DELIMITER ;

-- Usage:
-- CALL get_user_recommendations(4, 10);
```

