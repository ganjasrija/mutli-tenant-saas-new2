import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    tenantName: "",
    subdomain: "",
    adminEmail: "",
    adminFullName: "",
    adminPassword: "",
    confirmPassword: "",
    terms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !form.tenantName ||
      !form.subdomain ||
      !form.adminEmail ||
      !form.adminFullName ||
      !form.adminPassword ||
      !form.confirmPassword
    ) {
      return setError("All fields are required");
    }

    if (form.adminPassword.length < 8) {
      return setError("Password must be at least 8 characters");
    }

    if (form.adminPassword !== form.confirmPassword) {
      return setError("Passwords do not match");
    }

    if (!form.terms) {
      return setError("You must accept Terms & Conditions");
    }

    try {
      setLoading(true);

      await api.post("/auth/register-tenant", {
        tenantName: form.tenantName,
        subdomain: form.subdomain,
        adminEmail: form.adminEmail,
        adminFullName: form.adminFullName,
        adminPassword: form.adminPassword,
      });

      setSuccess("Organization registered successfully! Redirecting to login...");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <form className="register-card" onSubmit={handleSubmit}>
        <h2>Register Organization</h2>

        {/* ✅ ROW WITH GAP */}
        <div className="form-row">
          <input
            name="tenantName"
            placeholder="Organization Name"
            value={form.tenantName}
            onChange={handleChange}
          />

          <input
            name="subdomain"
            placeholder="Subdomain"
            value={form.subdomain}
            onChange={handleChange}
          />
        </div>

        {form.subdomain && (
          <div className="subdomain-preview">
            {form.subdomain}.yourapp.com
          </div>
        )}

        <input
          name="adminEmail"
          type="email"
          placeholder="Admin Email"
          value={form.adminEmail}
          onChange={handleChange}
        />

        <input
          name="adminFullName"
          placeholder="Admin Full Name"
          value={form.adminFullName}
          onChange={handleChange}
        />

        <div className="password-row">
          <input
            name="adminPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={form.adminPassword}
            onChange={handleChange}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        </div>

        <input
          name="confirmPassword"
          type={showPassword ? "text" : "password"}
          placeholder="Confirm Password"
          value={form.confirmPassword}
          onChange={handleChange}
        />

        <label className="terms">
          <input
            type="checkbox"
            name="terms"
            checked={form.terms}
            onChange={handleChange}
          />
         <span> I accept Terms & Conditions</span>
        </label>

        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}

        <button className="register-btn" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        <div className="register-footer">
          Already have an account? <Link to="/login">Login</Link>
        </div>
      </form>
    </div>
  );
}
