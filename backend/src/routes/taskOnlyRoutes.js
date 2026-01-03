import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  listAllTasks,        // 👈 ADD
  updateTaskStatus,
  updateTask,
  deleteTask
} from "../controllers/taskController.js";

const router = express.Router();

/**
 * API 21: GET /api/tasks
 */
router.get("/", authMiddleware, listAllTasks);

/**
 * API 18
 */
router.patch("/:taskId/status", authMiddleware, updateTaskStatus);

/**
 * API 19
 */
router.put("/:taskId", authMiddleware, updateTask);

/**
 * API 20
 */
router.delete("/:taskId", authMiddleware, deleteTask);

export default router;
