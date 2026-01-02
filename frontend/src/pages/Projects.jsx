import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";
import ProjectModal from "../components/ProjectModal";

export default function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const res = await api.get("/projects");
      setProjects(res.data.data);
    } catch {
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  // ✅ CREATE
  const openCreateModal = () => {
    setSelectedProject(null);
    setShowModal(true);
  };

  // ✅ EDIT
  const openEditModal = (project) => {
    setSelectedProject(project);
    setShowModal(true);
  };

  // ✅ VIEW
  const viewProject = (id) => {
    setShowModal(false);
    setSelectedProject(null);
    navigate(`/projects/${id}`);
  };

  const deleteProject = async (id) => {
    if (!window.confirm("Delete this project?")) return;
    await api.delete(`/projects/${id}`);
    loadProjects();
  };

  return (
    <>
      <Navbar />

      <div style={{ padding: 20 }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h2>Projects</h2>

          {/* 🔴 MUST be type="button" */}
          <button type="button" onClick={openCreateModal}>
            + Create New Project
          </button>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}

        {projects.map((p) => (
          <div
            key={p.id}
            style={{
              border: "1px solid #ddd",
              padding: 15,
              marginBottom: 12,
              borderRadius: 6,
            }}
          >
            <h3>{p.name}</h3>
            <p>{p.description || "No description"}</p>

            <div style={{ marginTop: 10 }}>
              <button
                type="button"
                onClick={() => viewProject(p.id)}
              >
                View
              </button>{" "}

              <button
                type="button"
                onClick={() => openEditModal(p)}
              >
                Edit
              </button>{" "}

              <button
                type="button"
                onClick={() => deleteProject(p.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ✅ MODAL */}
      {showModal && (
        <ProjectModal
          project={selectedProject}
          onClose={() => setShowModal(false)}
          onSuccess={loadProjects}
        />
      )}
    </>
  );
}
