import pg from "pg";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pool = new pg.Pool({
  host: "localhost",
  port: 5432,
  user: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DATABASE,
  max: 20,
  connectionTimeoutMillis: 0,
  idleTimeoutMillis: 0,
});


async function initDB() {
  try {
    const sqlPath = path.join(__dirname, "init.sql");
    const sql = fs.readFileSync(sqlPath, "utf-8");
    await pool.query(sql);
    console.log("Database initialized successfully.");
  } catch (err) {
    console.error("Database initialization failed:", err.message);
    throw err; 
  }
}

export { pool, initDB };