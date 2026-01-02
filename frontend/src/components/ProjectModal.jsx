import { useState } from "react";
import api from "../api/api";

export default function ProjectModal({ project, onClose, onSuccess }) {
  const [name, setName] = useState(project?.name || "");
  const [description, setDescription] = useState(project?.description || "");
  const [status, setStatus] = useState(project?.status || "active");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); // ✅ VERY IMPORTANT
    setError("");

    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    try {
      setLoading(true);

      if (project) {
        // ✅ EDIT PROJECT
        await api.put(`/projects/${project.id}`, {
          name,
          description,
          status,
        });
      } else {
        // ✅ CREATE PROJECT
        await api.post("/projects", {
          name,
          description,
          status,
        });
      }

      onSuccess(); // reload project list
      onClose();   // close modal
    } catch (err) {
      setError(err.response?.data?.message || "Operation failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={overlayStyle}>
      <form style={modalStyle} onSubmit={submit}>
        <h3>{project ? "Edit Project" : "Create Project"}</h3>

        <input
          type="text"
          placeholder="Project Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="active">Active</option>
          <option value="archived">Archived</option>
          <option value="completed">Completed</option>
        </select>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div style={{ display: "flex", gap: 10 }}>
          <button type="submit" disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </button>

          {/* ✅ MUST BE type="button" */}
          <button type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

/* ================= MODAL STYLES ================= */

const overlayStyle = {
  position: "fixed",          // ✅ FLOATS ON TOP
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,               // ✅ MOST IMPORTANT
};

const modalStyle = {
  background: "#fff",
  padding: 20,
  width: 400,
  borderRadius: 8,
  display: "flex",
  flexDirection: "column",
  gap: 10,
};
