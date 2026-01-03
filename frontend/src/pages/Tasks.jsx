import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import "./Tasks";
export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [status, setStatus] = useState("all");
  const [priority, setPriority] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [status, priority]);

  const loadTasks = async () => {
    try {
      setLoading(true);

      const params = {};
      if (status !== "all") params.status = status;
      if (priority !== "all") params.priority = priority;

      const res = await api.get("/tasks", { params });

      // ✅ THIS LINE FIXES EVERYTHING
      setTasks(res.data.data || []);
    } catch (err) {
      console.error("Load tasks error:", err);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  return (
  <>
    <Navbar />

    <div className="tasks-page">
      <h2>All Tasks</h2>

      {/* Filters */}
      <div className="tasks-filters">
        <select
          className="select"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="todo">Todo</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          className="select"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="all">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {loading && <p>Loading...</p>}

      {!loading && tasks.length === 0 && (
        <p className="empty">No tasks found</p>
      )}

      <div className="tasks-grid">
        {tasks.map((t) => (
          <div key={t.id} className="task-card">
            <div className="task-top">
              <h3>{t.title}</h3>
              <span className={`badge ${t.status}`}>{t.status}</span>
            </div>

            <p className="task-project">
              📁 {t.project_name}
            </p>

            <div className="task-meta">
              <span className={`priority ${t.priority}`}>
                {t.priority}
              </span>
              <span>
                📅 {new Date(t.created_at).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  </>
);
}