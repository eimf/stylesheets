import express from "express";
import cors from "cors";
import morgan from "morgan";
// import { router as appointmentRoutes } from "./routes/appointments.js";
import { router as serviceRoutes } from "./routes/services.js";
import { router as stylistRoutes } from "./routes/stylists.js";
import { initializeDatabase } from "./database/init.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// Routes
// app.use("/api/appointments", appointmentRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/stylists", stylistRoutes);

// Initialize database and start server
initializeDatabase().then(() => {
    app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on port ${PORT}`);
    });
});
