import { v4 as uuidv4 } from "uuid";
import pool from "../config/db.js";

/* =========================
   API 12: CREATE PROJECT
========================= */
export const createProject = async (req, res) => {
  const { name, description } = req.body;
  const { tenantId, userId } = req.user;

  if (!name) {
    return res.status(400).json({
      success: false,
      message: "Project name is required",
    });
  }

  try {
    const projectId = uuidv4();

    const result = await pool.query(
      `
      INSERT INTO projects
      (id, tenant_id, name, description, created_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
      `,
      [projectId, tenantId, name, description || null, userId]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("CREATE PROJECT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create project",
    });
  }
};

/* =========================
   API 13: LIST PROJECTS
========================= */
export const listProjects = async (req, res) => {
  const { tenantId } = req.user;
  const { status } = req.query;

  try {
    const result = await pool.query(
      `
      SELECT
        p.id,
        p.name,
        LEFT(p.description, 80) AS description,
        p.status,
        p.created_at,
        u.full_name AS created_by,
        COUNT(t.id) AS task_count
      FROM projects p
      JOIN users u ON u.id = p.created_by
      LEFT JOIN tasks t ON t.project_id = p.id
      WHERE p.tenant_id = $1
        AND ($2::text IS NULL OR p.status = $2)
      GROUP BY p.id, u.full_name
      ORDER BY p.created_at DESC
      `,
      [tenantId, status || null]
    );

    res.json({
      success: true,
      data: result.rows,
    });
  } catch (err) {
    console.error("LIST PROJECTS ERROR:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch projects",
    });
  }
};



/* =========================
   API 14: UPDATE PROJECT
========================= */
export const updateProject = async (req, res) => {
  const { projectId } = req.params;
  const { name, description, status } = req.body;
  const { tenantId } = req.user;

  try {
    const result = await pool.query(
      `
      UPDATE projects
      SET
        name = COALESCE($1, name),
        description = COALESCE($2, description),
        status = COALESCE($3, status),
        updated_at = NOW()
      WHERE id = $4 AND tenant_id = $5
      RETURNING *
      `,
      [name, description, status, projectId, tenantId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error("UPDATE PROJECT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update project",
    });
  }
};

/* =========================
   API 15: DELETE PROJECT
========================= */
export const deleteProject = async (req, res) => {
  const { projectId } = req.params;
  const { tenantId } = req.user;

  try {
    const result = await pool.query(
      "DELETE FROM projects WHERE id = $1 AND tenant_id = $2",
      [projectId, tenantId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    res.json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("DELETE PROJECT ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete project",
    });
  }
};
/* =========================
   API 21: GET PROJECT DETAILS
========================= */
export const getProjectById = async (req, res) => {
  const { projectId } = req.params;
  const { tenantId } = req.user;

  const result = await pool.query(
    `
    SELECT id, name, description, status, created_at
    FROM projects
    WHERE id = $1 AND tenant_id = $2
    `,
    [projectId, tenantId]
  );

  if (!result.rows.length) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
    });
  }

  res.json({
    success: true,
    data: result.rows[0],
  });
};
