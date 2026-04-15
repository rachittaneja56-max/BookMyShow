# Movie Booking System

This is a simple project I built for a hackathon. It is a movie ticket booking site where you can pick a movie and choose your seats. 

I took the basic idea and made it better by organizing the code properly and adding features like user accounts and a history of your bookings.

## Main Features

- **Accounts and Login:** You can create an account and log in. Your password is encrypted so it is safe.
- **Booking Tickets:** You must be logged in to book a seat. The system is designed to handle multiple people booking at the same time without any errors.
- **Theater Reset:** To make it easy to test, the theater seats reset automatically when they are all full. If you fill up the theater and then refresh the page, you will see it is empty and ready for new bookings.
- **Booking History:** Even when the theater resets, your tickets are not lost. You can always go to the "My Bookings" section to see everything you have booked in the past.
- **Clean Design:** The site looks modern and works well on both computers and phones.

## How to set this up on your computer

1. Download the code or clone the repository.
2. Open your terminal in the project folder and run `npm install` to get the necessary files.
3. You need to have PostgreSQL installed. Create a database called `bookmyshow`.
4. Create a file named `.env` in the main folder. Copy and paste the following, but use your own database password:

```env
DATABASE=bookmyshow
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
JWT_SECRET=any_random_words
```

5. Start the server by running `node index.mjs`.

Once it starts, it will set up the database for you. You can then go to `http://localhost:8080` in your browser to use the app.

## Project Structure

- `index.mjs`: This is the main file that runs the server.
- `index.html`: This is the frontend part that you see in the browser.
- `src/common`: This folder contains shared tools like database settings and security checks.
- `src/modules/auth`: This folder handles everything related to user accounts like signing up and logging in.

## List of API Endpoints

- `GET /`: Shows the website.
- `GET /seats`: Gets the current list of seats for a movie.
- `POST /api/auth/register`: Create a new account.
- `POST /api/auth/login`: Log into an existing account.
- `PUT /:id/:name`: Book a seat (requires login).
- `GET /api/my-bookings`: See your own booking history (requires login).
- `GET /reset`: A way to manually clear all seats and history if needed.
