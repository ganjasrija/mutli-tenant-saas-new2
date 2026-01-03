import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";
import ProjectModal from "../components/ProjectModal";
import "./Projects.css";

export default function Projects() {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadProjects();
  }, [statusFilter]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter !== "all") params.status = statusFilter;
      const res = await api.get("/projects", { params });
      setProjects(res.data.data);
    } catch {
      setError("Failed to load projects");
    } finally {
      setLoading(false);
    }
  };

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />

      <div className="projects-page">
        <div className="projects-header">
          <h2>Projects</h2>
          <button className="primary-btn" onClick={() => setShowModal(true)}>
            + Create New Project
          </button>
        </div>

        {/* FILTERS */}
        <div className="projects-filters">
          <input
            placeholder="Search project..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && filteredProjects.length === 0 && (
          <p className="empty">No projects found</p>
        )}

        <div className="projects-grid">
          {filteredProjects.map((p) => (
            <div key={p.id} className="project-card">
              <div className="project-top">
                <h3>{p.name}</h3>
                <span className={`status ${p.status}`}>{p.status}</span>
              </div>

              <p className="desc">{p.description || "No description"}</p>

              <div className="meta">
                <span>📋 {p.task_count} Tasks</span>
                <span>📅 {new Date(p.created_at).toLocaleDateString()}</span>
                <span>👤 {p.created_by}</span>
              </div>

              <div className="actions">
                <button onClick={() => navigate(`/projects/${p.id}`)}>
                  View
                </button>
                <button onClick={() => {
                  setSelectedProject(p);
                  setShowModal(true);
                }}>
                  Edit
                </button>
                <button className="danger" onClick={async () => {
                  if (!window.confirm("Delete project?")) return;
                  await api.delete(`/projects/${p.id}`);
                  loadProjects();
                }}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <ProjectModal
          project={selectedProject}
          onClose={() => {
            setShowModal(false);
            setSelectedProject(null);
          }}
          onSuccess={loadProjects}
        />
      )}
    </>
  );
}
