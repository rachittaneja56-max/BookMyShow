import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { pool, initDB } from "./src/common/db.js";
import authRoutes from "./src/modules/auth/auth.routes.js";
import authenticate from "./src/common/middlewares/auth.middleware.js";
const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 8080;

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/seats", async (req, res) => {
  try {
    const movie_id = req.query.movie_id || 1;
    
    // RESET ON RELOAD LOGIC: Check if all seats are booked for this movie
    const checkSql = "SELECT COUNT(*) FROM seats WHERE movie_id = $1 AND isbooked = FALSE";
    const checkResult = await pool.query(checkSql, [movie_id]);
    const availableCount = parseInt(checkResult.rows[0].count);

    if (availableCount === 0) {
      // Theater is full, reset it for a new round
      await pool.query("UPDATE seats SET isbooked = FALSE, name = NULL, user_id = NULL WHERE movie_id = $1", [movie_id]);
    }

    const result = await pool.query(
      "SELECT * FROM seats WHERE movie_id = $1 ORDER BY seat_number::int ASC, id ASC",
      [movie_id]
    );
    res.send(result.rows);
  } catch (err) {
    console.error("Error fetching seats:", err.message);
    res.status(500).send({ error: "Failed to fetch seats" });
  }
});

app.get("/api/my-bookings", authenticate, async (req, res) => {
  try {
    const userId = req.user.user_id || req.user.id;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized user context." });
    }
    const sql = `
      SELECT b.id, b.seat_number, m.title 
      FROM bookings b 
      JOIN movies m ON b.movie_id = m.id 
      WHERE b.user_id = $1
      ORDER BY b.booked_at DESC, m.title, b.seat_number::int
    `;
    const result = await pool.query(sql, [userId]);
    res.send(result.rows);
  } catch (err) {
    console.error("My Bookings fetch error:", err.message);
    res.status(500).send({ error: "Failed to fetch bookings" });
  }
});

app.put("/:id/:name", authenticate, async (req, res) => {
  const conn = await pool.connect();
  try {
    const id = req.params.id;
    const name = req.params.name;
    const userId = req.user.user_id;

    await conn.query("BEGIN");

    const sql =
      "SELECT * FROM seats WHERE id = $1 AND isbooked = false FOR UPDATE";
    const result = await conn.query(sql, [id]);

    if (result.rowCount === 0) {
      await conn.query("ROLLBACK");
      res.send({ error: "Seat already booked" });
      return;
    }

    const sqlU =
      "UPDATE seats SET isbooked = true, name = $2, user_id = $3 WHERE id = $1 RETURNING *";
    const updateResult = await conn.query(sqlU, [id, name, userId]);
    const movieId = result.rows[0].movie_id;
    const seatNumber = result.rows[0].seat_number;

    // Create a permanent record in the bookings table
    await conn.query(
      "INSERT INTO bookings (user_id, movie_id, seat_number) VALUES ($1, $2, $3)",
      [userId, movieId, seatNumber]
    );

    await conn.query("COMMIT");
    res.send({ message: "Seat booked successfully", details: updateResult.rows[0] });
  } catch (ex) {
    await conn.query("ROLLBACK");
    console.error("Booking error:", ex.message);
    res.status(500).send({ error: "Booking failed" });
  } finally {
    conn.release();
  }
});

app.get("/reset", async (req, res) => {
  const conn = await pool.connect();
  try {
    await conn.query("BEGIN");
    await conn.query("UPDATE seats SET isbooked = FALSE, name = NULL, user_id = NULL");
    await conn.query("DELETE FROM bookings"); 
    await conn.query("COMMIT");
    res.json({ message: "Success! All seats and history are now cleared. 🍿" });
  } catch (ex) {
    await conn.query("ROLLBACK");
    console.error("Reset error:", ex.message);
    res.status(500).json({ error: "Failed to reset seats" });
  } finally {
    conn.release();
  }
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

app.get("/ping", (req, res) => {
  res.status(200).send("pong");
});



async function startServer() {
  try {
    await initDB();
    app.listen(port, () =>
      console.log("Server starting on port: " + port)
    );
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

startServer();
