import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import mysql from "mysql2/promise";
import jwt from "jsonwebtoken";

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || "royal300_super_secret_key_2026";

app.use(express.json());

// MySQL Connection Pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "mypass",
  database: process.env.DB_NAME || "web_royal300",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Database Initialization
async function initDB() {
  try {
    const connection = await pool.getConnection();
    console.log("[DB] Connected to MySQL successfully");

    // Create Prices Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS prices (
        id INT AUTO_INCREMENT PRIMARY KEY,
        item_key VARCHAR(255) UNIQUE NOT NULL,
        price INT NOT NULL
      )
    `);

    // Create Leads Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS leads (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create Enquiries Table
    await connection.query(`
      CREATE TABLE IF NOT EXISTS enquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        lead_id INT NULL,
        details JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
      )
    `);

    // Seed default prices if empty
    const [rows]: any = await connection.query("SELECT COUNT(*) as count FROM prices");
    if (rows[0].count === 0) {
      const defaultPrices = [
        ['reels', 300], ['creatives', 80], ['videos', 1000], ['shootDays', 3000],
        ['facebook', 1500], ['instagram', 1500], ['youtube', 2000], ['google', 1000]
      ];
      for (const [key, price] of defaultPrices) {
        await connection.query("INSERT INTO prices (item_key, price) VALUES (?, ?)", [key, price]);
      }
      console.log("[DB] Seeded default prices");
    }

    connection.release();
  } catch (error) {
    console.error("[DB] Initialization failed. Check credentials and server status:", error);
  }
}

// Middleware for JWT Authentication
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (token == null) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// --- API ROUTES ---

// 1. Admin Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  if (username === "admin" && password === "admin123") {
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '24h' });
    res.json({ token });
  } else {
    res.status(401).json({ error: "Invalid credentials" });
  }
});

// 2. Fetch Prices (Public)
app.get("/api/prices", async (req, res) => {
  try {
    const [rows]: any = await pool.query("SELECT item_key, price FROM prices");
    const prices: Record<string, number> = {};
    rows.forEach((row: any) => {
      prices[row.item_key] = row.price;
    });
    res.json(prices);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch prices" });
  }
});

// 3. Update Prices (Protected)
app.post("/api/prices", authenticateToken, async (req, res) => {
  try {
    const pricesToUpdate = req.body; // e.g. { reels: 400, creatives: 90 }
    for (const [key, price] of Object.entries(pricesToUpdate)) {
      await pool.query(
        "INSERT INTO prices (item_key, price) VALUES (?, ?) ON DUPLICATE KEY UPDATE price = VALUES(price)",
        [key, price]
      );
    }
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update prices" });
  }
});

// 4. Submit Lead (Public) - Step 1
app.post("/api/leads", async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !phone) return res.status(400).json({ error: "Name and phone required" });
    
    const [result]: any = await pool.query("INSERT INTO leads (name, phone) VALUES (?, ?)", [name, phone]);
    res.json({ success: true, lead_id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save lead" });
  }
});

// 5. Submit Final Enquiry (Public) - Final Step
app.post("/api/enquiries", async (req, res) => {
  try {
    const { lead_id, details } = req.body;
    if (!details) return res.status(400).json({ error: "Details required" });

    await pool.query("INSERT INTO enquiries (lead_id, details) VALUES (?, ?)", [lead_id || null, JSON.stringify(details)]);
    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to save enquiry" });
  }
});

// 6. Get Leads (Protected)
app.get("/api/leads", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM leads ORDER BY created_at DESC");
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch leads" });
  }
});

// 7. Get Enquiries (Protected)
app.get("/api/enquiries", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT e.id as enquiry_id, e.details, e.created_at, l.name, l.phone 
      FROM enquiries e 
      LEFT JOIN leads l ON e.lead_id = l.id 
      ORDER BY e.created_at DESC
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch enquiries" });
  }
});

// Configure Vite or Static Asset serving
async function startServer() {
  await initDB();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    // Serve SPA index.html for all unknown client routes (React Router support)
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[BYOP Server] Running on http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
