## 🎬 Movie Recommendation System

### DBMS Mini Project

---

## 📌 Project Overview

This project is a **Movie Recommendation System** built using relational database concepts.
The system stores information about users, movies, and ratings given by users to movies.

Based on these ratings, user preferences can be analyzed and movie recommendations can be generated.

> ⚠️ **This project focuses on database design and SQL, not machine learning.**

---

## 🛠 Technologies Used

- **Database:** MySQL
- **Language:** SQL
- **Concepts Used:**
	- Relational Schema
	- Primary Key
	- Foreign Key
	- Constraints
	- Normalization (up to 3NF)

---

## 🗂 Database Structure

The database consists of three tables:

### 1️⃣ USER Table

Stores information about users.

| Column Name | Description                       |
|-------------|-----------------------------------|
| user_id     | Unique identifier for each user   |
| user_name   | Name of the user                  |

**Primary Key:** `user_id`

---

### 2️⃣ MOVIE Table

Stores details of movies.

| Column Name   | Description                        |
|--------------|------------------------------------|
| movie_id     | Unique identifier for each movie    |
| movie_title  | Title of the movie                  |
| genre        | Genre of the movie                  |
| release_year | Year the movie was released         |

**Primary Key:** `movie_id`

---

### 3️⃣ RATING Table

Stores ratings given by users to movies.

| Column Name | Description                          |
|-------------|--------------------------------------|
| rating_id   | Unique identifier for each rating     |
| user_id     | ID of the user who rated the movie    |
| movie_id    | ID of the movie being rated           |
| rating      | Rating value (1 to 5)                |

**Primary Key:** `rating_id`

**Foreign Keys:**

- `user_id` → USER(`user_id`)
- `movie_id` → MOVIE(`movie_id`)

**Constraint:** Rating value must be between 1 and 5

---

## 🔗 Relationships Between Tables

- One User can rate many Movies
- One Movie can receive ratings from many Users
- The RATING table resolves the many-to-many (M:N) relationship between USER and MOVIE

**Relationship Summary**

- USER 1 : N RATING
- MOVIE 1 : N RATING

---

## 🧱 Normalization

The database is normalized up to **Third Normal Form (3NF)**:

- **1NF:** All attributes are atomic and no repeating groups exist
- **2NF:** No partial dependency on primary keys
- **3NF:** No transitive dependency between non-key attributes

This ensures minimal redundancy and data consistency.

---

## 🧪 Sample Data

The database contains:

- 4 users
- 28 movies across multiple genres
- 112 ratings

This dataset allows meaningful testing and analysis.
