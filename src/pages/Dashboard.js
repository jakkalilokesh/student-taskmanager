import React, { useEffect, useState } from 'react';
import { API, Auth } from 'aws-amplify';
import { motion } from 'framer-motion';
import { FaChartLine, FaBook, FaClock, FaExclamationTriangle, FaSync } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/App.css';

const Dashboard = () => {
  const [stats, setStats] = useState({ tasks: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [user, statsData] = await Promise.all([
        Auth.currentAuthenticatedUser(),
        API.get('taskApi', '/stats')
      ]);

      setCurrentUser(user);
      setStats({
        tasks: statsData.total || 0,
        completed: statsData.completed || 0,
        pending: statsData.pending || 0
      });
    } catch (error) {
      console.error('Error loading dashboard:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="dashboard-loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <motion.div
          className="error-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <FaExclamationTriangle className="error-icon" />
          <p>{error}</p>
          <button onClick={fetchData} className="retry-button">
            <FaSync className="refresh-icon" />
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

  const statCards = [
    { icon: <FaBook className="stat-icon" />, title: 'Total Tasks', value: stats.tasks, color: 'blue' },
    { icon: <FaChartLine className="stat-icon" />, title: 'Completed', value: stats.completed, color: 'green' },
    { icon: <FaClock className="stat-icon" />, title: 'Pending', value: stats.pending, color: 'yellow' }
  ];

  return (
    <div className="dashboard-container">
      <motion.h1
        className="dashboard-title"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Welcome, {currentUser?.attributes?.name || currentUser?.username || 'User'}!
      </motion.h1>

      <div className="stats-grid">
        {statCards.map((card, index) => (
          <motion.div
            key={card.title}
            className={`stat-card stat-${card.color}`}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="stat-icon-container">
              {card.icon}
            </div>
            <div className="stat-content">
              <h3>{card.title}</h3>
              <p>{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;