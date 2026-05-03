import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';

const Tasks = () => {
  const { projectId } = useParams();
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', assignedTo: '', dueDate: '' });
  const [project, setProject] = useState(null);
  const { user } = useContext(AuthContext);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await axios.get(`/api/tasks/project/${projectId}`);
      setTasks(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [projectId]);

  const fetchProject = useCallback(async () => {
    try {
      const res = await axios.get('/api/projects');
      const proj = res.data.find(p => p._id === projectId);
      setProject(proj);
    } catch (err) {
      console.error(err);
    }
  }, [projectId]);

  useEffect(() => {
    fetchTasks();
    fetchProject();
  }, [fetchTasks, fetchProject]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, project: projectId };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.dueDate) delete payload.dueDate;
      if (!payload.description) delete payload.description;

      await axios.post('/api/tasks', payload);
      setForm({ title: '', description: '', assignedTo: '', dueDate: '' });
      fetchTasks();
    } catch (err) {
      alert('Failed to create task');
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/tasks/${id}`, { status });
      fetchTasks();
    } catch (err) {
      alert('Failed to update task');
    }
  };

  const deleteTask = async (id) => {
    try {
      await axios.delete(`/api/tasks/${id}`);
      fetchTasks();
    } catch (err) {
      alert('Failed to delete task');
    }
  };

  return (
    <div className="App">
      <Header />
      <main className="page-shell">
        <section className="card">
          <div className="section-title">Tasks for Project</div>
          <p className="section-subtitle">Manage task assignments, update progress, and keep the team aligned.</p>
          {user?.role === 'Admin' && (
            <form onSubmit={handleSubmit} className="form-grid">
              <input
                type="text"
                placeholder="Task Title"
                className="input-field"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                className="textarea-field"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <select
                value={form.assignedTo}
                className="select-field"
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              >
                <option value="">Unassigned</option>
                {project?.members.map((member) => (
                  <option key={member._id} value={member._id}>
                    {member.name}
                  </option>
                ))}
              </select>
              <input
                type="date"
                className="input-field"
                value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
              />
              <button type="submit" className="btn btn-primary">Create Task</button>
            </form>
          )}
          <div className="tasks-grid">
            {tasks.map((task) => (
              <div key={task._id} className="task-card">
                <h3>{task.title}</h3>
                <p>{task.description || 'No description added yet.'}</p>
                <p><strong>Status:</strong> {task.status}</p>
                <p><strong>Assigned to:</strong> {task.assignedTo?.name || 'Unassigned'}</p>
                <p><strong>Due:</strong> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'N/A'}</p>
                <div className="card-actions">
                  {(user?.role === 'Admin' || task.assignedTo?._id === user?.id) && (
                    <select
                      className="select-field"
                      value={task.status}
                      onChange={(e) => updateStatus(task._id, e.target.value)}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  )}
                  {user?.role === 'Admin' && (
                    <button className="btn btn-danger" onClick={() => deleteTask(task._id)}>
                      Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Tasks;