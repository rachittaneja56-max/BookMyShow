import { pool } from "../../common/db.js";

export async function createUser(name, email, hashedPassword) {
  const query = `
    INSERT INTO users (name, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, name, email, created_at
  `;
  const result = await pool.query(query, [name, email, hashedPassword]);
  return result.rows[0];
}

export async function getUserByEmail(email) {
  const query = `
    SELECT id, name, email, password_hash, created_at
    FROM users
    WHERE email = $1
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
}
