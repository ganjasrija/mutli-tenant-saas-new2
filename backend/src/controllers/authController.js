import bcrypt from "bcrypt";
import pool from "../config/db.js";
import jwt from "jsonwebtoken";
const generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "24h" }
  );
};


/**
 * API 1: Register Tenant
 */
export const registerTenant = async (req, res) => {
  const { tenantName, subdomain, adminEmail, adminPassword, adminFullName } = req.body;

  if (!tenantName || !subdomain || !adminEmail || !adminPassword || !adminFullName) {
    return res.status(400).json({
      success: false,
      message: "All fields are required",
    });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const subdomainCheck = await client.query(
      "SELECT id FROM tenants WHERE subdomain = $1",
      [subdomain]
    );

    if (subdomainCheck.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Subdomain already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const tenantResult = await client.query(
      `INSERT INTO tenants
       (name, subdomain, status, subscription_plan, max_users, max_projects)
       VALUES ($1, $2, 'active', 'free', 5, 3)
       RETURNING id`,
      [tenantName, subdomain]
    );

    const tenantId = tenantResult.rows[0].id;

    const userResult = await client.query(
      `INSERT INTO users
       (tenant_id, email, password_hash, full_name, role)
       VALUES ($1, $2, $3, $4, 'tenant_admin')
       RETURNING id, email, full_name, role`,
      [tenantId, adminEmail, hashedPassword, adminFullName]
    );

    await client.query("COMMIT");

    return res.status(201).json({
      success: true,
      message: "Tenant registered successfully",
      data: {
        tenantId,
        subdomain,
        adminUser: userResult.rows[0],
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("REGISTER TENANT ERROR:", err);

    return res.status(500).json({
      success: false,
      message: "Tenant registration failed",
    });
  } finally {
    client.release();
  }
};
//login
export const login = async (req, res) => {
  const { email, password, tenantSubdomain } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required",
    });
  }

  try {
    // 1️⃣ Get user by email
    const userResult = await pool.query(
      `SELECT * FROM users WHERE email = $1`,
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const user = userResult.rows[0];

    // 2️⃣ Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // 🔑 SUPER ADMIN LOGIN (NO TENANT)
    if (user.role === "super_admin") {
      const token = generateToken({
        userId: user.id,
        tenantId: null,
        role: user.role,
      });

      return res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
            tenantId: null,
          },
          token,
          expiresIn: 86400,
        },
      });
    }

    // 3️⃣ TENANT REQUIRED FOR NORMAL USERS
    if (!tenantSubdomain) {
      return res.status(400).json({
        success: false,
        message: "tenantSubdomain is required",
      });
    }

    const tenantResult = await pool.query(
      `SELECT * FROM tenants WHERE subdomain = $1`,
      [tenantSubdomain]
    );

    if (tenantResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Tenant not found",
      });
    }

    const tenant = tenantResult.rows[0];

    if (tenant.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Tenant is not active",
      });
    }

    if (user.tenant_id !== tenant.id) {
      return res.status(403).json({
        success: false,
        message: "User does not belong to this tenant",
      });
    }

    // 4️⃣ Generate token for tenant users
    const token = generateToken({
      userId: user.id,
      tenantId: tenant.id,
      role: user.role,
    });

    return res.status(200).json({
      success: true,
      data: {
        user: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          role: user.role,
          tenantId: tenant.id,
        },
        token,
        expiresIn: 86400,
      },
    });

  } catch (error) {
  console.error("LOGIN ERROR FULL:", error);

  return res.status(500).json({
    success: false,
    message: error.message,   // 👈 SHOW REAL ERROR
  });
}

}

/*
 * 
 * API 3: Get Current User
 */
export const getCurrentUser = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id, u.email, u.full_name, u.role, u.is_active,
              t.id AS tenant_id, t.name, t.subdomain,
              t.subscription_plan, t.max_users, t.max_projects
       FROM users u
       LEFT JOIN tenants t ON u.tenant_id = t.id
       WHERE u.id = $1`,
      [req.user.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = result.rows[0];

    return res.status(200).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
        isActive: user.is_active,
        tenantId: user.tenant_id,
        tenant: user.tenant_id
          ? {
              id: user.tenant_id,
              name: user.name,
              subdomain: user.subdomain,
              subscriptionPlan: user.subscription_plan,
              maxUsers: user.max_users,
              maxProjects: user.max_projects,
            }
          : null,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch current user",
    });
  }
};

/**
 * API 4: Logout
 */
export const logout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

