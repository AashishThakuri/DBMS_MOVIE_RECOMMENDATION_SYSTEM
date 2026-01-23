CREATE DATABASE MovieRecommendationSystem;
USE MovieRecommendationSystem;
CREATE TABLE User (
    user_id INT PRIMARY KEY,
    user_name VARCHAR(50) NOT NULL
);
CREATE TABLE Movie (
    movie_id INT PRIMARY KEY,
    movie_title VARCHAR(100) NOT NULL,
    genre VARCHAR(30),
    release_year INT
);
CREATE TABLE Rating (
    rating_id INT PRIMARY KEY,
    user_id INT,
    movie_id INT,
    rating INT CHECK (rating BETWEEN 1 AND 5),

    FOREIGN KEY (user_id) REFERENCES User(user_id),
    FOREIGN KEY (movie_id) REFERENCES Movie(movie_id)
);
