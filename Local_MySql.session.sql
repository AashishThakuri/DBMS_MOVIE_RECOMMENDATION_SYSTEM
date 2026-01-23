drop DATABASE lab_04;
DROP DATABASE retaildb;
DROP DATABASE studentdb;
DROP DATABASE student_db;
DROP DATABASE test;

use MovieRecommendationSystem;
INSERT INTO Movie (movie_id, movie_title, genre, release_year) VALUES
(1, 'Troy', 'Action/Drama', 2004),
(2, 'Pablo Escobar', 'Crime/Biography', 2012),
(3, 'F1', 'Sport/Action', 2025),
(4, 'Ford vs Ferrari', 'Sport/Drama', 2019),
(5, 'The Prestige', 'Mystery/Sci-Fi', 2006),
(6, 'Son of Satyamurthy', 'Action/Drama', 2015),
(7, 'Main Hoon Lucky The Racer', 'Action/Comedy', 2014),
(8, 'Shutter Island', 'Mystery/Thriller', 2010),
(9, 'Inglourious Basterds', 'War/Action', 2009),
(10, 'Ne Zha 2', 'Animation/Fantasy', 2025),
(11, 'Hell Paradise', 'Anime/Action', 2023),
(12, 'Grave of the Fireflies', 'Animation/War', 1988),
(13, 'I Want to Eat Your Pancreas', 'Animation/Drama', 2018),
(14, 'American Psycho', 'Crime/Horror', 2000),
(15, 'Unko Sweater', 'Drama', 2024),
(16, 'Game of Thrones', 'Fantasy/Drama', 2011),
(17, 'Suits', 'Drama/Comedy', 2011),
(18, 'Breaking Bad', 'Crime/Drama', 2008),
(19, 'The Substance', 'Horror/Sci-Fi', 2024),
(20, 'The Wolf of Wall Street', 'Biography/Comedy', 2013),
(21, 'True Detective', 'Crime/Mystery', 2014),
(22, 'Interstellar', 'Sci-Fi/Adventure', 2014),
(23, 'Inception', 'Sci-Fi/Action', 2010),
(24, 'Memories of Murder', 'Crime/Mystery', 2003),
(25, 'Her', 'Romance/Sci-Fi', 2013),
(26, 'Dead Poets Society', 'Drama', 1989),
(27, 'Hannibal', 'Crime/Thriller', 2013),
(28, 'Parasite', 'Thriller/Drama', 2019);

SELECT * from Movie;
INSERT INTO User (user_id, user_name) VALUES
(1, 'Samman'),
(2, 'Aashish'),
(3, 'Supreme'),
(4,'Kritesh')
;
SELECT * FROM user;

INSERT INTO Rating (rating_id, user_id, movie_id, rating) VALUES
-- Samman (User 1) Ratings
(1, 1, 1, 4), (2, 1, 2, 3), (3, 1, 3, 4), (4, 1, 4, 5), (5, 1, 5, 5), (6, 1, 6, 3), (7, 1, 7, 3), (8, 1, 8, 5), (9, 1, 9, 4), (10, 1, 10, 3), (11, 1, 11, 4), (12, 1, 12, 5), (13, 1, 13, 4), (14, 1, 14, 4), (15, 1, 15, 3), (16, 1, 16, 5), (17, 1, 17, 4), (18, 1, 18, 5), (19, 1, 19, 5), (20, 1, 20, 4), (21, 1, 21, 5), (22, 1, 22, 5), (23, 1, 23, 5), (24, 1, 24, 4), (25, 1, 25, 5), (26, 1, 26, 4), (27, 1, 27, 4), (28, 1, 28, 5),

-- Aashish (User 2) Ratings
(29, 2, 1, 5), (30, 2, 2, 4), (31, 2, 3, 3), (32, 2, 4, 4), (33, 2, 5, 5), (34, 2, 6, 4), (35, 2, 7, 4), (36, 2, 8, 5), (37, 2, 9, 5), (38, 2, 10, 4), (39, 2, 11, 3), (40, 2, 12, 5), (41, 2, 13, 5), (42, 2, 14, 3), (43, 2, 15, 4), (44, 2, 16, 4), (45, 2, 17, 5), (46, 2, 18, 5), (47, 2, 19, 3), (48, 2, 20, 5), (49, 2, 21, 4), (50, 2, 22, 5), (51, 2, 23, 5), (52, 2, 24, 5), (53, 2, 25, 4), (54, 2, 26, 5), (55, 2, 27, 4), (56, 2, 28, 5),

-- Supreme (User 3) Ratings
(57, 3, 1, 5), (58, 3, 2, 5), (59, 3, 3, 5), (60, 3, 4, 4), (61, 3, 5, 4), (62, 3, 6, 4), (63, 3, 7, 5), (64, 3, 8, 4), (65, 3, 9, 5), (66, 3, 10, 4), (67, 3, 11, 5), (68, 3, 12, 4), (69, 3, 13, 3), (70, 3, 14, 4), (71, 3, 15, 3), (72, 3, 16, 4), (73, 3, 17, 4), (74, 3, 18, 4), (75, 3, 19, 5), (76, 3, 20, 4), (77, 3, 21, 5), (78, 3, 22, 4), (79, 3, 23, 4), (80, 3, 24, 4), (81, 3, 25, 3), (82, 3, 26, 3), (83, 3, 27, 5), (84, 3, 28, 4),

-- Kritesh (User 4) Ratings
(85, 4, 1, 3), (86, 4, 2, 5), (87, 4, 3, 4), (88, 4, 4, 5), (89, 4, 5, 4), (90, 4, 6, 4), (91, 4, 7, 4), (92, 4, 8, 4), (93, 4, 9, 4), (94, 4, 10, 4), (95, 4, 11, 4), (96, 4, 12, 4), (97, 4, 13, 5), (98, 4, 14, 5), (99, 4, 15, 5), (100, 4, 16, 5), (101, 4, 17, 5), (102, 4, 18, 5), (103, 4, 19, 4), (104, 4, 20, 5), (105, 4, 21, 5), (106, 4, 22, 5), (107, 4, 23, 5), (108, 4, 24, 5), (109, 4, 25, 4), (110, 4, 26, 4), (111, 4, 27, 5), (112, 4, 28, 5);

SELECT * FROM rating;


