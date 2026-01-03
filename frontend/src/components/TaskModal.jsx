import { useEffect, useState } from "react";
import api from "../api/api";
import "./TaskModal.css";

export default function TaskModal({ projectId, task, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setForm({
        title: task.title,
        description: task.description || "",
        priority: task.priority,
        status: task.status,
      });
    }
  }, [task]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      if (task) {
        // ✅ EDIT TASK
        await api.put(`/tasks/${task.id}`, form);
      } else {
        // ✅ ADD TASK
        await api.post(`/projects/${projectId}/tasks`, form);
      }

      onSuccess();
      onClose();
    } catch (err) {
      alert("Task save failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-card">
        <h3>{task ? "Edit Task" : "Add Task"}</h3>

        <form onSubmit={handleSubmit}>
          <input
            name="title"
            placeholder="Task title"
            value={form.title}
            onChange={handleChange}
            required
          />

          <textarea
            name="description"
            placeholder="Description"
            value={form.description}
            onChange={handleChange}
          />

          <select name="priority" value={form.priority} onChange={handleChange}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select name="status" value={form.status} onChange={handleChange}>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>

          <div className="modal-actions">
            <button type="button" onClick={onClose}>
              Cancel
            </button>
            <button disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
