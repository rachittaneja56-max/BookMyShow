CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS movies (
  id SERIAL PRIMARY KEY,
  title TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS seats (
  id SERIAL PRIMARY KEY,
  movie_id INTEGER NOT NULL REFERENCES movies(id) ON DELETE CASCADE,
  seat_number INTEGER NOT NULL,
  isbooked BOOLEAN DEFAULT FALSE,
  name TEXT,
  user_id INTEGER REFERENCES users(id) ON DELETE SET NULL
);

INSERT INTO movies (title)
SELECT 'Avengers: Endgame'
WHERE NOT EXISTS (SELECT 1 FROM movies WHERE title = 'Avengers: Endgame');

INSERT INTO movies (title)
SELECT 'Dhurandhar'
WHERE NOT EXISTS (SELECT 1 FROM movies WHERE title = 'Dhurandhar');


INSERT INTO seats (movie_id, seat_number, isbooked, name)
SELECT m.id, s.n, FALSE, NULL
FROM movies m
CROSS JOIN generate_series(1, 48) AS s(n)
WHERE m.title = 'Avengers: Endgame'
  AND NOT EXISTS (
    SELECT 1 FROM seats WHERE movie_id = m.id AND seat_number = s.n
  );

INSERT INTO seats (movie_id, seat_number, isbooked, name)
SELECT m.id, s.n, FALSE, NULL
FROM movies m
CROSS JOIN generate_series(1, 48) AS s(n)
WHERE m.title = 'Dhurandhar'
  AND NOT EXISTS (
    SELECT 1 FROM seats WHERE movie_id = m.id AND seat_number = s.n
  );

UPDATE seats
SET isbooked = FALSE, name = NULL, user_id = NULL
WHERE movie_id IN (
    SELECT movie_id
    FROM seats
    GROUP BY movie_id
    HAVING COUNT(*) FILTER (WHERE isbooked = FALSE) = 0
);