import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Header from '../components/Header';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/tasks/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="App">
      <Header />
      <main className="page-shell">
        <section className="card">
          <div className="section-title">Dashboard</div>
          <p className="section-subtitle">Quickly see where your team is today and what needs attention.</p>
          <div className="stats-grid">
            <div className="metric-card">
              <h3>Total Tasks</h3>
              <p>{stats.total ?? 0}</p>
            </div>
            <div className="metric-card">
              <h3>Completed</h3>
              <p>{stats.completed ?? 0}</p>
            </div>
            <div className="metric-card">
              <h3>Pending</h3>
              <p>{stats.pending ?? 0}</p>
            </div>
            <div className="metric-card">
              <h3>In Progress</h3>
              <p>{stats.inProgress ?? 0}</p>
            </div>
            <div className="metric-card">
              <h3>Overdue</h3>
              <p>{stats.overdue ?? 0}</p>
            </div>
          </div>
          <div className="card-actions">
            <Link className="btn btn-primary" to="/projects">Browse Projects</Link>
            <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;