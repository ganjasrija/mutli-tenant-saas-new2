import { useContext, useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { AuthContext } from "../auth/AuthContext";

export default function Tenants() {
  const { user } = useContext(AuthContext);
  const [tenants, setTenants] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user?.role === "super_admin") {
      loadTenants();
    }
  }, [user]);

  const loadTenants = async () => {
    try {
      const res = await api.get("/tenants");
      setTenants(res.data.data.tenants);
    } catch (err) {
      setError("Failed to load tenants");
    }
  };

  if (user.role !== "super_admin") {
    return (
      <>
        <Navbar />
        <p style={{ padding: 20 }}>Access denied</p>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div style={{ padding: 20 }}>
        <h2>Tenants</h2>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Name</th>
              <th>Subdomain</th>
              <th>Status</th>
              <th>Plan</th>
              <th>Users</th>
              <th>Projects</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.subdomain}</td>
                <td>{t.status}</td>
                <td>{t.subscription_plan}</td>
                <td>{t.total_users}</td>
                <td>{t.total_projects}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
