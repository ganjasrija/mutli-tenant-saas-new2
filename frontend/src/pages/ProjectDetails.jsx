import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";
import TaskModal from "../components/TaskModal";
import "./ProjectDetails.css";

export default function ProjectDetails() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ MODAL STATE
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const projectRes = await api.get(`/projects/${projectId}`);
      const taskRes = await api.get(`/projects/${projectId}/tasks`);

      setProject(projectRes.data.data);
      setTasks(taskRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     ACTION HANDLERS
  ========================= */

  const changeStatus = async (taskId, status) => {
    try {
      await api.patch(`/tasks/${taskId}/status`, { status });
      loadData();
    } catch {
      alert("Failed to update status");
    }
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm("Delete this task?")) return;

    try {
      await api.delete(`/tasks/${taskId}`);
      loadData();
    } catch {
      alert("Delete failed");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!project) return <p>Project not found</p>;

  return (
    <>
      <Navbar />

      <div className="project-page">
        {/* HEADER */}
        <div className="project-header">
          <div>
            <h1>{project.name}</h1>
            <p className="description">{project.description}</p>
          </div>

          <span className={`status ${project.status}`}>
            {project.status}
          </span>
        </div>

        {/* TASK HEADER */}
        <div className="tasks-header">
          <h2>Tasks</h2>

          {/* ✅ ADD TASK WORKING */}
          <button
            className="primary-btn"
            onClick={() => {
              setSelectedTask(null);
              setShowTaskModal(true);
            }}
          >
            + Add Task
          </button>
        </div>

        {/* TASKS */}
        <div className="task-grid">
          {tasks.map((t) => (
            <div key={t.id} className="task-card">
              <div className="task-top">
                <h3>{t.title}</h3>
                <span className={`priority ${t.priority}`}>
                  {t.priority}
                </span>
              </div>

              <div className="meta">
                <span className={`badge ${t.status}`}>
                  {t.status}
                </span>
                <span className="assignee">
                  👤 {t.full_name || "Unassigned"}
                </span>
              </div>

              {/* ACTION BUTTONS */}
              <div className="task-actions">
                <button onClick={() => changeStatus(t.id, "todo")}>
                  Todo
                </button>

                <button onClick={() => changeStatus(t.id, "in_progress")}>
                  In Progress
                </button>

                <button onClick={() => changeStatus(t.id, "completed")}>
                  Completed
                </button>

                {/* ✅ EDIT WORKING */}
                <button
                  className="edit"
                  onClick={() => {
                    setSelectedTask(t);
                    setShowTaskModal(true);
                  }}
                >
                  Edit
                </button>

                <button
                  className="danger"
                  onClick={() => deleteTask(t.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ TASK MODAL */}
      {showTaskModal && (
        <TaskModal
          projectId={projectId}
          task={selectedTask}
          onClose={() => setShowTaskModal(false)}
          onSuccess={loadData}
        />
      )}
    </>
  );
}
