import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [form, setForm] = useState({ name: '', description: '', members: [] });
  const [users, setUsers] = useState([]);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    fetchProjects();
    if (user?.role === 'Admin') fetchUsers();
  }, [user]);

  const fetchProjects = async () => {
    try {
      const res = await axios.get('/api/projects');
      setProjects(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('/api/users');
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log('Sending project creation request with data:', form);
      const res = await axios.post('/api/projects', form);
      console.log('Project created successfully:', res.data);
      setForm({ name: '', description: '', members: [] });
      fetchProjects();
    } catch (err) {
      console.log('Project creation failed. Error details:', err.response?.data || err.message);
      alert(`Failed to create project: ${err.response?.data?.message || err.message}`);
    }
  };

  const deleteProject = async (id) => {
    try {
      await axios.delete(`/api/projects/${id}`);
      fetchProjects();
    } catch (err) {
      alert('Failed to delete project');
    }
  };

  return (
    <div className="App">
      <Header />
      <main className="page-shell">
        <section className="card">
          <div className="section-title">Projects</div>
          <p className="section-subtitle">Create and manage your team projects. Admins can invite members and track progress across tasks.</p>
          {user?.role === 'Admin' && (
            <form onSubmit={handleSubmit} className="form-grid">
              <input
                type="text"
                placeholder="Project Name"
                className="input-field"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                className="textarea-field"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
              <select
                multiple
                className="select-field"
                value={form.members}
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setForm({ ...form, members: selected });
                }}
              >
                {users.map((userItem) => (
                  <option key={userItem._id} value={userItem._id}>
                    {userItem.name} ({userItem.email})
                  </option>
                ))}
              </select>
              <button type="submit" className="btn btn-primary">Create Project</button>
            </form>
          )}
          <div className="projects-grid">
            {projects.map((project) => (
              <div key={project._id} className="project-card">
                <h3>{project.name}</h3>
                <p>{project.description || 'No description provided.'}</p>
                <p><strong>Members:</strong> {project.members.map((m) => m.name).join(', ')}</p>
                <div className="card-actions">
                  <Link className="action-link" to={`/tasks/${project._id}`}>View Tasks</Link>
                  {user?.role === 'Admin' && (
                    <button className="btn btn-danger" onClick={() => deleteProject(project._id)}>
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

export default Projects;