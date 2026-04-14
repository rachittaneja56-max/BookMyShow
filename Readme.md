# Book My Ticket - Hackathon Submission


I built upon the original starter code: https://github.com/chaicodehq/book-my-ticket by restructuring it into a cleaner, more modular architecture. Instead of putting everything in a single file, the logic is split across controllers, services, and middleware.

Here is a quick rundown of the main features I added:

- **JWT Authentication:** Users can register and log in. Passwords are securely hashed using bcryptjs, and sessions are managed via JSON Web Tokens.
- **Protected Booking Flow:** The primary booking endpoint is secured. Only authenticated users can lock in a seat.
- **Concurrency Control:** When booking a seat, the system uses Postgres row-level locks (`FOR UPDATE`) inside a database transaction. This ensures that if two users try to book the exact same seat at the exact same millisecond, it won't result in a double booking.
- **Relational Data:** The database schema has been normalized. There are now separate tables for users, movies, and seats, all linked together properly with foreign keys.
- **Frontend:** I also created a simple single-page application using vanilla HTML, JS, and TailwindCSS. It lets you register, log in, view available seats for mocked movies, book tickets, and see an overview of your booking history.

## Project Structure

The codebase is organized intuitively to separate concerns:

- `index.mjs` is the main entry point that sets up the Express server.
- `index.html` contains the frontend styling and logic.
- `src/common` holds shared logic like database connections, initialization scripts, JWT utilities, and custom error handling.
- `src/modules/auth` contains the authentication flow, cleanly structured using the Controller -> Service pattern along with data validation DTOs.

## How to run it locally

If you want to spin this up on your local machine, here are the steps:

1. Clone this repository and navigate into the folder.
2. Run `npm install` to pull down the dependencies.
3. Make sure you have PostgreSQL installed and running locally. You will need to manually create an empty database via pgAdmin or psql (for example, named `bookmyshow`).
4. Create a `.env` file in the root of the project. You'll need to configure it with your database credentials. It should look like this:

```env
DATABASE=bookmyshow
DB_USERNAME=postgres
DB_PASSWORD=your_password
JWT_SECRET=some_random_secret_string
```

5. Run `node index.mjs` to start the server.

When the server starts up, it will automatically connect to Postgres, create the necessary tables, and seed the mock movie data for you. It listens on port 8080 by default. You can open `http://localhost:8080` in your browser to check out the frontend interface.

## API Endpoints Overview

If you are just testing the backend logic via Postman, here are the main endpoints available:

- `GET /` - Serves the frontend UI.
- `GET /seats?movie_id={id}` - Public endpoint that returns all seats and their availability status for a given movie.
- `POST /api/auth/register` - Registers a new user. The JSON body requires `name`, `email`, and `password`.
- `POST /api/auth/login` - Authenticates an existing user and returns a JWT. The JSON body requires `email` and `password`.
- `PUT /:id/:name` - Books a specific seat. This requires a valid JWT sent in the `Authorization: Bearer <token>` header.
- `GET /api/my-bookings` - Returns all active seat bookings specifically belonging to the authenticated user. This also requires a valid JWT header.
