import { useContext, useEffect, useState } from "react";
import api from "../api/api";
import { AuthContext } from "../auth/AuthContext";
import Navbar from "../components/Navbar";


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
      // 🔹 Get projects
      const projectRes = await api.get("/projects");
      const projectList = projectRes.data.data;
      setProjects(projectList);

      let allTasks = [];

      // 🔹 Get tasks for each project
      for (let p of projectList) {
        const taskRes = await api.get(`/projects/${p.id}/tasks`);
        allTasks = [...allTasks, ...taskRes.data.data];
      }

      // 🔹 Filter tasks assigned to current user
      const assignedTasks = allTasks.filter(
        (t) => t.assigned_user_id === user.id
      );

      setMyTasks(assignedTasks);

      // 🔹 Stats
      const completed = allTasks.filter((t) => t.status === "completed").length;
      const pending = allTasks.filter((t) => t.status !== "completed").length;

      setStats({
        totalProjects: projectList.length,
        totalTasks: allTasks.length,
        completedTasks: completed,
        pendingTasks: pending,
      });
    } catch (error) {
      console.error("Dashboard load error:", error);
    }
  };
return (
  <>
    <Navbar />

    <div style={{ padding: "20px" }}>
      <h2>Dashboard</h2>

      <p>
        Welcome <b>{user.fullName}</b> ({user.role})
      </p>

      {/* 🔹 Stats */}
      <div style={{ display: "flex", gap: 20 }}>
        <div>Projects: {stats.totalProjects}</div>
        <div>Total Tasks: {stats.totalTasks}</div>
        <div>Completed: {stats.completedTasks}</div>
        <div>Pending: {stats.pendingTasks}</div>
      </div>

      <hr />

      {/* 🔹 Recent Projects */}
      <h3>Recent Projects</h3>
      {projects.slice(0, 5).map((p) => (
        <div key={p.id}>
          <b>{p.name}</b> — {p.status}
        </div>
      ))}

      <hr />

      {/* 🔹 My Tasks */}
      <h3>My Tasks</h3>
      {myTasks.length === 0 && <p>No tasks assigned</p>}
      {myTasks.map((t) => (
        <div key={t.id}>
          {t.title} | {t.priority} | {t.status}
        </div>
      ))}
    </div>
  </>
);

}