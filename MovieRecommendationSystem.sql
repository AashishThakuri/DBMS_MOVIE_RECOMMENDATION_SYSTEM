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
    language VARCHAR(40),
    poster_url VARCHAR(255),
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





