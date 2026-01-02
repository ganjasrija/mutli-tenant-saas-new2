import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  updateTaskStatus,
  updateTask,
  deleteTask
} from "../controllers/taskController.js";

const router = express.Router();

/**
 * API 18: Update Task Status
 * PATCH /api/tasks/:taskId/status
 */
router.patch("/:taskId/status", authMiddleware, updateTaskStatus);

/**
 * API 19: Update Task
 * PUT /api/tasks/:taskId
 */
router.put("/:taskId", authMiddleware, updateTask);

/**
 * API 20: Delete Task
 * DELETE /api/tasks/:taskId
 */
router.delete("/:taskId", authMiddleware, deleteTask);

export default router;
