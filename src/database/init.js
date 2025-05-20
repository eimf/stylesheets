import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { seedDatabase } from "./seed.js";

let db = null;

export async function getDatabase() {
    if (db) {
        return db;
    }

    db = await open({
        filename: "./stylesheets.db",
        driver: sqlite3.Database,
    });

    return db;
}

export async function initializeDatabase() {
    const db = await getDatabase();

    await db.exec(`
      CREATE TABLE IF NOT EXISTS stylists (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        name TEXT,
        last_name TEXT,
        specialization TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS services (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        stylist_id INTEGER NOT NULL,
        customer_name TEXT NOT NULL,
        service_type TEXT CHECK(service_type IN ('credit', 'cash', 'cash_app', 'other')) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        tip DECIMAL(10,2) DEFAULT 0,
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (stylist_id) REFERENCES stylists(id)
      );
    `);
    await seedDatabase(db);
}
