import express from "express";
import { body, validationResult } from "express-validator";
import { getDatabase } from "../database/init.js";

export const router = express.Router();

// Validation middleware for services
const validateService = [
    body("stylist_id").isInt().withMessage("Valid stylist ID is required"),
    body("customer_name")
        .trim()
        .notEmpty()
        .withMessage("Customer name is required"),
    body("service_type")
        .isIn(["credit", "cash", "cash_app", "other"])
        .withMessage(
            "Service type must be one of: credit, cash, cash_app, other"
        ),
    body("price").isDecimal().withMessage("Valid price is required"),
    body("tip").optional().isDecimal().withMessage("Tip must be a decimal"),
    body("notes").optional().isString(),
];

// Get all services
router.get("/", async (req, res) => {
    try {
        const db = await getDatabase();
        const services = await db.all("SELECT * FROM services");
        res.json(services);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create new service
router.post("/", validateService, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const db = await getDatabase();
        const {
            stylist_id,
            customer_name,
            service_type,
            price,
            tip = 0,
            notes,
        } = req.body;

        const result = await db.run(
            `
      INSERT INTO services (stylist_id, customer_name, service_type, price, tip, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
            [stylist_id, customer_name, service_type, price, tip, notes]
        );

        res.status(201).json({
            id: result.lastID,
            message: "Service created successfully",
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update a service by ID
router.put("/:id", validateService, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const db = await getDatabase();
        const {
            stylist_id,
            customer_name,
            service_type,
            price,
            tip = 0,
            notes,
        } = req.body;

        const result = await db.run(
            `
            UPDATE services
            SET stylist_id = ?, customer_name = ?, service_type = ?, price = ?, tip = ?, notes = ?
            WHERE id = ?
            `,
            [
                stylist_id,
                customer_name,
                service_type,
                price,
                tip,
                notes,
                req.params.id,
            ]
        );

        if (result.changes === 0) {
            return res.status(404).json({ error: "Service not found" });
        }

        res.json({ message: "Service updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get service by ID
router.get("/:id", async (req, res) => {
    try {
        const db = await getDatabase();
        const service = await db.get(
            "SELECT * FROM services WHERE id = ?",
            req.params.id
        );

        if (!service) {
            return res.status(404).json({ error: "Service not found" });
        }

        res.json(service);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
