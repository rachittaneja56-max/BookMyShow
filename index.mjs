import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import { pool, initDB } from "./src/common/db.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const port = process.env.PORT || 8080;

const app = express();
app.use(cors());

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/seats", async (req, res) => {
  try {
    const movie_id = req.query.movie_id || 1;
    const result = await pool.query(
      "SELECT * FROM seats WHERE movie_id = $1 ORDER BY seat_number ASC",
      [movie_id]
    );
    res.send(result.rows);
  } catch (err) {
    console.error("Error fetching seats:", err.message);
    res.status(500).send({ error: "Failed to fetch seats" });
  }
});

app.put("/:id/:name", async (req, res) => {
  const conn = await pool.connect();
  try {
    const id = req.params.id;
    const name = req.params.name;

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
      "UPDATE seats SET isbooked = true, name = $2 WHERE id = $1";
    const updateResult = await conn.query(sqlU, [id, name]);

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
