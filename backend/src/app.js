import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import taskOnlyRoutes from "./routes/taskOnlyRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import tenantRoutes from "./routes/tenantRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import errorHandler from "./middleware/errorHandler.js";

dotenv.config();

const app = express();

/* ✅ FIXED CORS */
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);


app.use(express.json());

// ✅ Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// routes
app.use("/api/auth", authRoutes);
app.use("/api/tenants", tenantRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskOnlyRoutes);

// error handler
app.use(errorHandler);

export default app;
