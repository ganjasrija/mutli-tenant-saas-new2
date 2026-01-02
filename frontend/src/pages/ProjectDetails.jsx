import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import Navbar from "../components/Navbar";
import TaskModal from "../components/TaskModal";

export default function ProjectDetails() {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    loadData();
  }, [projectId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // ✅ API 13 — LIST PROJECTS
      const projectRes = await api.get("/projects");
      const foundProject = projectRes.data.data.projects
        ? projectRes.data.data.projects.find(p => p.id === projectId)
        : projectRes.data.data.find(p => p.id === projectId);

      setProject(foundProject || null);

      // ✅ Tasks API (you already have this)
      const taskRes = await api.get(`/projects/${projectId}/tasks`);
      setTasks(taskRes.data.data);
    } catch (err) {
      console.error("Load error", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (taskId, status) => {
    await api.patch(`/tasks/${taskId}/status`, { status });
    loadData();
  };

  const deleteTask = async (taskId) => {
    if (!window.confirm("Delete task?")) return;
    await api.delete(`/tasks/${taskId}`);
    loadData();
  };

  if (loading) return <p>Loading...</p>;
  if (!project) return <p>Project not found</p>;

  return (
    <>
      <Navbar />

      <div style={{ padding: 20 }}>
        <h2>{project.name}</h2>
        <p>{project.description}</p>
        <p><b>Status:</b> {project.status}</p>

        <hr />

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <h3>Tasks</h3>
          <button onClick={() => {
            setSelectedTask(null);
            setShowTaskModal(true);
          }}>
            + Add Task
          </button>
        </div>

        {tasks.length === 0 && <p>No tasks found</p>}

        {tasks.map((t) => (
          <div key={t.id} style={{ border: "1px solid #ccc", padding: 10, marginBottom: 8 }}>
            <b>{t.title}</b>
            <p>Status: {t.status}</p>

            <button onClick={() => updateStatus(t.id, "todo")}>Todo</button>
            <button onClick={() => updateStatus(t.id, "in_progress")}>In Progress</button>
            <button onClick={() => updateStatus(t.id, "completed")}>Completed</button>
            <button onClick={() => {
              setSelectedTask(t);
              setShowTaskModal(true);
            }}>Edit</button>
            <button onClick={() => deleteTask(t.id)}>Delete</button>
          </div>
        ))}
      </div>

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
