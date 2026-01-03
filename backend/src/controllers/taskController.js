import pool from "../config/db.js";

/* =========================
   API 16: CREATE TASK
========================= */
export const createTask = async (req, res) => {
  const { projectId } = req.params;
  const { title, description, assignedTo, priority = "medium", dueDate } = req.body;
  const { tenantId } = req.user;

  if (!title) {
    return res.status(400).json({ success: false, message: "Task title required" });
  }

  try {
    const project = await pool.query(
      "SELECT tenant_id FROM projects WHERE id = $1",
      [projectId]
    );

    if (project.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Project not found" });
    }

    if (project.rows[0].tenant_id !== tenantId) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const result = await pool.query(
      `
      INSERT INTO tasks
      (project_id, tenant_id, title, description, status, priority, assigned_to, due_date)
      VALUES ($1, $2, $3, $4, 'todo', $5, $6, $7)
      RETURNING *
      `,
      [
        projectId,
        tenantId,
        title,
        description || null,
        priority,
        assignedTo || null,
        dueDate || null
      ]
    );

    res.status(201).json({ success: true, data: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Create task failed" });
  }
};

/* =========================
   API 17: LIST PROJECT TASKS
========================= */
export const listProjectTasks = async (req, res) => {
  const { projectId } = req.params;
  const { tenantId } = req.user;

  try {
    const result = await pool.query(
      `
      SELECT
        t.id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.due_date,
        t.created_at,
        u.id AS assigned_user_id,
        u.full_name
      FROM tasks t
      LEFT JOIN users u ON u.id = t.assigned_to
      WHERE t.project_id = $1 AND t.tenant_id = $2
      ORDER BY t.created_at DESC
      `,
      [projectId, tenantId]
    );

    res.json({ success: true, data: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Fetch tasks failed" });
  }
};

/* =========================
   API 18: UPDATE TASK STATUS
========================= */
export const updateTaskStatus = async (req, res) => {
  const { taskId } = req.params;
  const { status } = req.body;
  const { tenantId } = req.user;

  const allowed = ["todo", "in_progress", "completed"];
  if (!allowed.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status" });
  }

  const result = await pool.query(
    `
    UPDATE tasks
    SET status = $1, updated_at = NOW()
    WHERE id = $2 AND tenant_id = $3
    RETURNING *
    `,
    [status, taskId, tenantId]
  );

  if (!result.rows.length) {
    return res.status(404).json({ success: false, message: "Task not found" });
  }

  res.json({ success: true, data: result.rows[0] });
};

/* =========================
   API 19: UPDATE TASK
========================= */
export const updateTask = async (req, res) => {
  const { taskId } = req.params;
  const { tenantId } = req.user;

  const { title, description, priority, status, assignedTo, dueDate } = req.body;

  const result = await pool.query(
    `
    UPDATE tasks
    SET
      title = COALESCE($1, title),
      description = COALESCE($2, description),
      priority = COALESCE($3, priority),
      status = COALESCE($4, status),
      assigned_to = $5,
      due_date = $6,
      updated_at = NOW()
    WHERE id = $7 AND tenant_id = $8
    RETURNING *
    `,
    [title, description, priority, status, assignedTo, dueDate, taskId, tenantId]
  );

  if (!result.rows.length) {
    return res.status(404).json({ success: false, message: "Task not found" });
  }

  res.json({ success: true, data: result.rows[0] });
};

/* =========================
   API 20: DELETE TASK
========================= */
export const deleteTask = async (req, res) => {
  const { taskId } = req.params;
  const { tenantId } = req.user;

  const result = await pool.query(
    "DELETE FROM tasks WHERE id = $1 AND tenant_id = $2",
    [taskId, tenantId]
  );

  if (!result.rowCount) {
    return res.status(404).json({ success: false, message: "Task not found" });
  }

  res.json({ success: true, message: "Task deleted" });
};
/* =========================
   API 21: LIST ALL TASKS
   GET /api/tasks
========================= */
export const listAllTasks = async (req, res) => {
  const { tenantId } = req.user;
  const { status, priority } = req.query;

  let conditions = ["t.tenant_id = $1"];
  let values = [tenantId];
  let index = 2;

  if (status && status !== "all") {
    conditions.push(`t.status = $${index++}`);
    values.push(status);
  }

  if (priority && priority !== "all") {
    conditions.push(`t.priority = $${index++}`);
    values.push(priority);
  }

  const whereClause = conditions.join(" AND ");

  const result = await pool.query(
    `
    SELECT
      t.id,
      t.title,
      t.status,
      t.priority,
      t.created_at,
      p.name AS project_name
    FROM tasks t
    JOIN projects p ON p.id = t.project_id
    WHERE ${whereClause}
    ORDER BY t.created_at DESC
    `,
    values
  );

  res.json({ success: true, data: result.rows });
};
