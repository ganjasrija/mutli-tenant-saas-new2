import { Link } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../auth/AuthContext";
import "./Navbar.css";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <span className="logo">Multi-Tenant SaaS</span>

        <Link to="/dashboard">Dashboard</Link>
        <Link to="/projects">Projects</Link>

        {(user.role === "tenant_admin" || user.role === "super_admin") && (
          <Link to="/tasks">Tasks</Link>
        )}

        {user.role === "tenant_admin" && (
          <Link to="/users">Users</Link>
        )}

        {user.role === "super_admin" && (
          <Link to="/tenants">Tenants</Link>
        )}
      </div>

      <div className="navbar-right">
        <span className="user-info">
          {user.fullName} <small>({user.role})</small>
        </span>
        <button className="logout-btn" onClick={logout}>
          Logout
        </button>
      </div>
    </nav>
  );
}
