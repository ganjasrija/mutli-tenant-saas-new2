import express from "express";
import {
  createTask,
  listProjectTasks,
  updateTaskStatus,
  updateTask,
  deleteTask
} from "../controllers/taskController.js";

const router = express.Router({ mergeParams: true });

router.post("/", createTask);
router.get("/", listProjectTasks);
router.patch("/:taskId/status", updateTaskStatus);
router.put("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);

export default router;
