import express from "express";
import { getDatabase } from "../database/init.js";

export const router = express.Router();

// Get all stylists
router.get("/", async (req, res) => {
    try {
        const db = await getDatabase();
        const stylists = await db.all("SELECT * FROM stylists");
        res.json(stylists);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
