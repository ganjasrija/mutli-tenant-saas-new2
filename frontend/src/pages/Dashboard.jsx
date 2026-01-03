import { useContext, useEffect, useState } from "react";
import api from "../api/api";
import { AuthContext } from "../auth/AuthContext";
import Navbar from "../components/Navbar";
import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useContext(AuthContext);

  const [projects, setProjects] = useState([]);
  const [myTasks, setMyTasks] = useState([]);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
  });

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const projectRes = await api.get("/projects");
      const projectList = projectRes.data.data;
      setProjects(projectList);

      let allTasks = [];
      for (let p of projectList) {
        const taskRes = await api.get(`/projects/${p.id}/tasks`);
        allTasks = [...allTasks, ...taskRes.data.data];
      }

      const assignedTasks = allTasks.filter(
        (t) => t.assigned_user_id === user.id
      );
      setMyTasks(assignedTasks);

      setStats({
        totalProjects: projectList.length,
        totalTasks: allTasks.length,
        completedTasks: allTasks.filter(t => t.status === "completed").length,
        pendingTasks: allTasks.filter(t => t.status !== "completed").length,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <Navbar />

      <div className="dashboard">
        <h2>Dashboard</h2>
        <p className="welcome">
          Welcome <b>{user.fullName}</b> ({user.role})
        </p>

        {/* STATS */}
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats.totalProjects}</h3>
            <p>Projects</p>
          </div>
          <div className="stat-card">
            <h3>{stats.totalTasks}</h3>
            <p>Total Tasks</p>
          </div>
          <div className="stat-card success">
            <h3>{stats.completedTasks}</h3>
            <p>Completed</p>
          </div>
          <div className="stat-card warning">
            <h3>{stats.pendingTasks}</h3>
            <p>Pending</p>
          </div>
        </div>

        {/* RECENT PROJECTS */}
        <div className="section">
          <h3>Recent Projects</h3>
          {projects.slice(0, 5).map((p) => (
            <div key={p.id} className="list-card">
              <span>{p.name}</span>
              <span className={`badge ${p.status}`}>{p.status}</span>
            </div>
          ))}
        </div>

        {/* MY TASKS */}
        <div className="section">
          <h3>My Tasks</h3>

          {myTasks.length === 0 && (
            <p className="empty">No tasks assigned</p>
          )}

          {myTasks.map((t) => (
            <div key={t.id} className="task-card">
              <b>{t.title}</b>
              <div className="task-meta">
                <span className={`priority ${t.priority}`}>{t.priority}</span>
                <span className={`badge ${t.status}`}>{t.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
