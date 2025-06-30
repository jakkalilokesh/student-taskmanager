import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaSync, FaCog } from 'react-icons/fa';
import { Auth } from 'aws-amplify';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/App.css';

const Calendar = () => {
  const [timeZone, setTimeZone] = useState('UTC');
  const [viewType, setViewType] = useState('month');
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        setUserEmail(user.attributes.email);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  const calendarSrc = `https://calendar.google.com/calendar/embed?
    height=600&
    wkst=1&
    bgcolor=%23ffffff&
    ctz=${timeZone}&
    showTitle=0&
    showNav=1&
    showDate=1&
    showPrint=0&
    showTabs=1&
    showCalendars=0&
    mode=${viewType}&
    src=${encodeURIComponent(userEmail)}`
    .replace(/\s+/g, ''); // Remove all whitespace

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 500); // Simulate refresh
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <div className="calendar-page p-6 max-w-6xl mx-auto">
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex items-center gap-3 text-2xl font-bold text-gray-800">
          <FaCalendarAlt className="text-blue-600" />
          Calendar View
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleRefresh}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Refresh Calendar"
          >
            <FaSync className="text-blue-600" />
          </button>
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Calendar Settings"
          >
            <FaCog className="text-blue-600" />
          </button>
        </div>
      </motion.div>

      {showSettings && (
        <motion.div
          className="bg-white p-4 mb-6 rounded-lg shadow-md"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Zone
              </label>
              <select
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="America/Chicago">Central Time</option>
                <option value="America/Los_Angeles">Pacific Time</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                View Type
              </label>
              <select
                value={viewType}
                onChange={(e) => setViewType(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="month">Month</option>
                <option value="week">Week</option>
                <option value="day">Day</option>
                <option value="agenda">Agenda</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      <motion.div
        className="calendar-container rounded-lg shadow-lg overflow-hidden bg-white"
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <iframe
          src={calendarSrc}
          style={{
            border: '0',
            width: '100%',
            height: '600px',
            minHeight: '600px'
          }}
          title="Google Calendar"
          loading="lazy"
          referrerPolicy="no-referrer"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </motion.div>
    </div>
  );
};

export default Calendar;