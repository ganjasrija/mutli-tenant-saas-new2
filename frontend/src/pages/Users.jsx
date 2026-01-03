import { useContext, useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { AuthContext } from "../auth/AuthContext";
import UserModal from "../components/UserModal";

export default function Users() {
  const { user } = useContext(AuthContext);

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // ✅ NEW
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  useEffect(() => {
    if (user?.role === "tenant_admin") {
      loadUsers();
    }
  }, [user]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/tenants/${user.tenantId}/users`);
      setUsers(res.data.data.users);
    } catch {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    await api.delete(`/users/${id}`);
    loadUsers();
  };

  // 🔍 FILTER LOGIC
  const filteredUsers = users.filter((u) => {
    const matchSearch =
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());

    const matchRole =
      roleFilter === "all" || u.role === roleFilter;

    return matchSearch && matchRole;
  });

  if (user.role !== "tenant_admin") {
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
        <h2>Users</h2>

        {/* 🔍 SEARCH + FILTER */}
        <div style={{ display: "flex", gap: 10, marginBottom: 15 }}>
          <input
            placeholder="Search by name or email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="user">User</option>
            <option value="tenant_admin">Tenant Admin</option>
          </select>

          <button
            onClick={() => {
              setSelectedUser(null);
              setShowModal(true);
            }}
          >
            + Add User
          </button>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {filteredUsers.length === 0 && !loading && (
          <p>No users found</p>
        )}

        {filteredUsers.length > 0 && (
          <table border="1" cellPadding="8" width="100%">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>

                  {/* 🏷️ ROLE BADGE */}
                  <td>
                    <span
                      style={{
                        padding: "4px 8px",
                        borderRadius: 6,
                        fontSize: 12,
                        background:
                          u.role === "tenant_admin"
                            ? "#e0e7ff"
                            : "#dcfce7",
                      }}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td style={{ color: u.isActive ? "green" : "red" }}>
                    {u.isActive ? "Active" : "Inactive"}
                  </td>

                  <td>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>

                  <td>
                    <button
                      onClick={() => {
                        setSelectedUser(u);
                        setShowModal(true);
                      }}
                    >
                      Edit
                    </button>{" "}
                    <button onClick={() => deleteUser(u.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <UserModal
          tenantId={user.tenantId}
          user={selectedUser}
          onClose={() => setShowModal(false)}
          onSuccess={loadUsers}
        />
      )}
    </>
  );
}
