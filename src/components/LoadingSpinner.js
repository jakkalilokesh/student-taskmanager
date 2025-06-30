import React from 'react';
import { motion } from 'framer-motion';
import '../styles/App.css';

const LoadingSpinner = ({ fullScreen = false, size = 'medium' }) => {
  const sizeClasses = {
    small: 'loading-spinner-small',
    medium: 'loading-spinner-medium',
    large: 'loading-spinner-large'
  };

  return (
    <div className={`loading-spinner-container ${fullScreen ? 'loading-spinner-fullscreen' : ''}`}>
      <motion.div
        className={`loading-spinner ${sizeClasses[size]}`}
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      >
        <div className="loading-spinner-inner"></div>
      </motion.div>
    </div>
  );
};

export default LoadingSpinner;