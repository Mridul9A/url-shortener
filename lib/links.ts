import { query } from "./db";

export type Link = {
  id: number;
  code: string;
  url: string;
  click_count: number;
  last_clicked: string | null;
  created_at: string;
};

export function generateCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export async function getAllLinks(): Promise<Link[]> {
  const res = await query<Link>("SELECT * FROM links ORDER BY created_at DESC");
  return res.rows;
}

export async function getLinkByCode(code: string): Promise<Link | null> {
  const res = await query<Link>("SELECT * FROM links WHERE code = $1", [code]);
  return res.rows[0] || null;
}

export async function createLink(targetUrl: string, customCode?: string): Promise<Link> {
  const code = customCode || generateCode();

  const exists = await getLinkByCode(code);
  if (exists) {
    throw new Error("DUPLICATE_CODE");
  }

  const res = await query<Link>(
    "INSERT INTO links (code, url) VALUES ($1, $2) RETURNING *",
    [code, targetUrl]
  );

  return res.rows[0];
}

export async function deleteLink(code: string): Promise<boolean> {
  const res = await query<Link>(
    "DELETE FROM links WHERE code = $1 RETURNING *",
    [code]
  );
  return res.rows.length === 1;
}

export async function incrementClick(code: string) {
  await query(
    "UPDATE links SET click_count = click_count + 1, last_clicked = NOW() WHERE code = $1",
    [code]
  );
}
