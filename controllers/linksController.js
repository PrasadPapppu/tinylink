import { pool } from "../db.js";

export async function createLink(code, url) {
  return pool.query(
    "INSERT INTO links (code, target_url) VALUES ($1, $2) RETURNING *",
    [code, url]
  );
}

export async function getAllLinks() {
  return pool.query("SELECT * FROM links ORDER BY created_at DESC");
}

export async function getLink(code) {
  return pool.query("SELECT * FROM links WHERE code = $1", [code]);
}

export async function deleteLink(code) {
  return pool.query("DELETE FROM links WHERE code = $1", [code]);
}

export async function incrementClick(code) {
  return pool.query(
    `
    UPDATE links
    SET total_clicks = total_clicks + 1,
        last_clicked = NOW()
    WHERE code = $1
    RETURNING *
    `,
    [code]
  );
}
