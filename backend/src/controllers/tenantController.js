import pool from "../config/db.js";
import bcrypt from "bcrypt";

/* =========================
   API 5: GET TENANT DETAILS
========================= */
export const getTenantDetails = async (req, res) => {
  const { tenantId } = req.params;
  const { tenantId: userTenantId, role } = req.user;

  if (role !== "super_admin" && userTenantId !== tenantId) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  try {
    const tenantResult = await pool.query(
      `
      SELECT id, name, subdomain, status,
             subscription_plan, max_users, max_projects, created_at
      FROM tenants
      WHERE id = $1
      `,
      [tenantId]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    const tenant = tenantResult.rows[0];

    const usersCount = await pool.query(
      "SELECT COUNT(*) FROM users WHERE tenant_id = $1",
      [tenantId]
    );

    const projectsCount = await pool.query(
      "SELECT COUNT(*) FROM projects WHERE tenant_id = $1",
      [tenantId]
    );

    const tasksCount = await pool.query(
      "SELECT COUNT(*) FROM tasks WHERE tenant_id = $1",
      [tenantId]
    );

    res.status(200).json({
      success: true,
      data: {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        status: tenant.status,
        subscriptionPlan: tenant.subscription_plan,
        maxUsers: tenant.max_users,
        maxProjects: tenant.max_projects,
        createdAt: tenant.created_at,
        stats: {
          totalUsers: Number(usersCount.rows[0].count),
          totalProjects: Number(projectsCount.rows[0].count),
          totalTasks: Number(tasksCount.rows[0].count),
        },
      },
    });
  } catch (error) {
    console.error("GET TENANT DETAILS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tenant details",
    });
  }
};

/* =========================
   API 6: UPDATE TENANT
========================= */
export const updateTenant = async (req, res) => {
  const { tenantId } = req.params;
  const { role, tenantId: userTenantId } = req.user;
  const { name, status, subscriptionPlan, maxUsers, maxProjects } = req.body;

  if (role !== "super_admin" && userTenantId !== tenantId) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized access",
    });
  }

  if (
    role === "tenant_admin" &&
    (status || subscriptionPlan || maxUsers || maxProjects)
  ) {
    return res.status(403).json({
      success: false,
      message: "Tenant admin can only update name",
    });
  }

  const fields = [];
  const values = [];
  let index = 1;

  if (name) {
    fields.push(`name = $${index++}`);
    values.push(name);
  }

  if (role === "super_admin") {
    if (status) {
      fields.push(`status = $${index++}`);
      values.push(status);
    }
    if (subscriptionPlan) {
      fields.push(`subscription_plan = $${index++}`);
      values.push(subscriptionPlan);
    }
    if (maxUsers) {
      fields.push(`max_users = $${index++}`);
      values.push(maxUsers);
    }
    if (maxProjects) {
      fields.push(`max_projects = $${index++}`);
      values.push(maxProjects);
    }
  }

  if (fields.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No valid fields to update",
    });
  }

  values.push(tenantId);

  const result = await pool.query(
    `
    UPDATE tenants
    SET ${fields.join(", ")}, updated_at = NOW()
    WHERE id = $${index}
    RETURNING id, name, updated_at
    `,
    values
  );

  if (result.rows.length === 0) {
    return res.status(404).json({
      success: false,
      message: "Tenant not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Tenant updated successfully",
    data: result.rows[0],
  });
};

/* =========================
   API 7: LIST ALL TENANTS
========================= */
export const listAllTenants = async (req, res) => {
  if (req.user.role !== "super_admin") {
    return res.status(403).json({
      success: false,
      message: "Super admin only",
    });
  }

  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const offset = (page - 1) * limit;

  try {
    const countResult = await pool.query(
      "SELECT COUNT(*) FROM tenants"
    );

    const totalTenants = Number(countResult.rows[0].count);
    const totalPages = Math.ceil(totalTenants / limit);

    const result = await pool.query(
      `
      SELECT
        t.id,
        t.name,
        t.subdomain,
        t.status,
        t.subscription_plan,
        COUNT(DISTINCT u.id) AS total_users,
        COUNT(DISTINCT p.id) AS total_projects,
        t.created_at
      FROM tenants t
      LEFT JOIN users u ON u.tenant_id = t.id
      LEFT JOIN projects p ON p.tenant_id = t.id
      GROUP BY t.id
      ORDER BY t.created_at DESC
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    res.status(200).json({
      success: true,
      data: {
        tenants: result.rows,
        pagination: {
          currentPage: page,
          totalPages,
          totalTenants,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("LIST TENANTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch tenants",
    });
  }
};


/* =========================
   API 8: ADD USER TO TENANT
========================= */


  export const addUserToTenant = async (req, res) => {
  const { tenantId } = req.params;
  const { tenantId: userTenantId, role } = req.user;
  const { email, password, fullName, role: newRole } = req.body;

  if (role !== "tenant_admin" || tenantId !== userTenantId) {
    return res.status(403).json({
      success: false,
      message: "Not authorized",
    });
  }

  if (!email || !password || !fullName) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `
      INSERT INTO users (tenant_id, email, password_hash, full_name, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, tenant_id, email, full_name, role, is_active, created_at
      `,
      [tenantId, email, hashedPassword, fullName, newRole || "user"]
    );

    const user = result.rows[0];

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        tenantId: user.tenant_id,
        isActive: user.is_active,
        createdAt: user.created_at,
      },
    });
  } catch (error) {
    console.error("ADD USER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add user",
    });
  }
};


/* =========================
   API 9: LIST TENANT USERS
========================= */
export const listTenantUsers = async (req, res) => {
  const { tenantId } = req.params;
  const { tenantId: userTenantId } = req.user;

  if (tenantId !== userTenantId) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized",
    });
  }

  // 🔹 Query params
  const search = req.query.search || "";
  const role = req.query.role;
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 50, 100);
  const offset = (page - 1) * limit;

  // 🔹 Dynamic filters
  let conditions = [`tenant_id = $1`];
  let values = [tenantId];
  let index = 2;

  if (search) {
    conditions.push(
      `(email ILIKE $${index} OR full_name ILIKE $${index})`
    );
    values.push(`%${search}%`);
    index++;
  }

  if (role) {
    conditions.push(`role = $${index}`);
    values.push(role);
    index++;
  }

  const whereClause = conditions.join(" AND ");

  try {
    // 🔹 Count
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM users WHERE ${whereClause}`,
      values
    );

    const total = Number(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    // 🔹 Data
    const result = await pool.query(
      `
      SELECT id, email, full_name, role, is_active, created_at
      FROM users
      WHERE ${whereClause}
      ORDER BY created_at DESC
      LIMIT $${index} OFFSET $${index + 1}
      `,
      [...values, limit, offset]
    );

    res.status(200).json({
      success: true,
      data: {
        users: result.rows.map(u => ({
          id: u.id,
          email: u.email,
          fullName: u.full_name,
          role: u.role,
          isActive: u.is_active,
          createdAt: u.created_at,
        })),
        total,
        pagination: {
          currentPage: page,
          totalPages,
          limit,
        },
      },
    });
  } catch (error) {
    console.error("LIST USERS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};
