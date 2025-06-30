import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaTasks, FaCalendarAlt, FaCog, FaHome, FaSignOutAlt } from 'react-icons/fa';
import { motion } from 'framer-motion';
import '../styles/App.css';

const Navbar = ({ signOut, user }) => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  return (
    <motion.nav 
      className="navbar"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <div className="navbar-container">
        <div className="navbar-brand">
          Student TaskManager
        </div>
        
        <div className="navbar-links">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            <FaHome className="nav-icon" />
            <span>Dashboard</span>
          </Link>
          <Link 
            to="/tasks" 
            className={`nav-link ${isActive('/tasks') ? 'active' : ''}`}
          >
            <FaTasks className="nav-icon" />
            <span>Tasks</span>
          </Link>
          <Link 
            to="/calendar" 
            className={`nav-link ${isActive('/calendar') ? 'active' : ''}`}
          >
            <FaCalendarAlt className="nav-icon" />
            <span>Calendar</span>
          </Link>
          <Link 
            to="/settings" 
            className={`nav-link ${isActive('/settings') ? 'active' : ''}`}
          >
            <FaCog className="nav-icon" />
            <span>Settings</span>
          </Link>
        </div>
        
        <div className="navbar-user">
          <span className="user-email">
            {user?.attributes?.email || user?.username}
          </span>
          <button 
            onClick={signOut} 
            className="sign-out-button"
            aria-label="Sign out"
          >
            <FaSignOutAlt className="sign-out-icon" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;