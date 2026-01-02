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
    } catch (err) {
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await api.delete(`/users/${id}`);
      loadUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  // 🔒 Role-based access
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

        {/* ✅ Add User Button */}
        <button
          style={{ marginBottom: 15 }}
          onClick={() => {
            setSelectedUser(null);
            setShowModal(true);
          }}
        >
          + Add User
        </button>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {users.length === 0 && !loading && <p>No users found</p>}

        {users.length > 0 && (
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
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.fullName}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
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

      {/* ✅ User Modal */}
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
