import { useState } from "react";
import api from "../api/api";

export default function TaskModal({ projectId, task, onClose, onSuccess }) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [priority, setPriority] = useState(task?.priority || "medium");
  const [error, setError] = useState("");

  const submit = async () => {
    if (!title) {
      setError("Title is required");
      return;
    }

    try {
      if (task) {
        // 🔹 UPDATE TASK
        await api.put(`/tasks/${task.id}`, {
          title,
          description,
          priority,
        });
      } else {
        // 🔹 CREATE TASK
        await api.post(`/projects/${projectId}/tasks`, {
          title,
          description,
          priority,
        });
      }

      onSuccess(); // reload tasks
      onClose();   // close modal
    } catch (err) {
      setError("Task operation failed");
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        background: "rgba(0,0,0,0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div style={{ background: "#fff", padding: 20, width: 400 }}>
        <h3>{task ? "Edit Task" : "Add Task"}</h3>

        <input
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <div style={{ marginTop: 10 }}>
          <button onClick={submit}>Save</button>{" "}
          <button onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
