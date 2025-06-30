import React, { useState, useEffect } from 'react';
import { Auth } from 'aws-amplify';
import { motion } from 'framer-motion';
import { FaUserCog, FaSave, FaEdit, FaTimes } from 'react-icons/fa';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/App.css';

const Settings = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const fetchUserAttributes = async () => {
      try {
        const user = await Auth.currentAuthenticatedUser();
        setCurrentUser(user);
        const { attributes } = user;
        setFormData({
          name: attributes.name || attributes.given_name || user.username,
          email: attributes.email,
          currentPassword: '',
          newPassword: ''
        });
      } catch (error) {
        console.error('Error fetching user attributes:', error);
        setMessage({ text: 'Failed to load user data', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserAttributes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!currentUser) return;

    try {
      setIsLoading(true);
      setMessage(null);

      // Update user attributes
      await Auth.updateUserAttributes(currentUser, {
        name: formData.name,
        email: formData.email
      });

      // Update password if changed
      if (isChangingPassword && formData.newPassword) {
        await Auth.changePassword(
          currentUser,
          formData.currentPassword,
          formData.newPassword
        );
      }

      // Refresh user data
      const updatedUser = await Auth.currentAuthenticatedUser();
      setCurrentUser(updatedUser);

      setMessage({ text: 'Settings saved successfully!', type: 'success' });
      setIsEditing(false);
      setIsChangingPassword(false);
    } catch (error) {
      console.error('Error updating settings:', error);
      let errorMessage = error.message;
      
      if (error.code === 'NotAuthorizedException') {
        errorMessage = 'Current password is incorrect';
      } else if (error.code === 'InvalidParameterException') {
        errorMessage = 'New password does not meet requirements';
      }
      
      setMessage({ 
        text: `Failed to update settings: ${errorMessage}`, 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setIsChangingPassword(false);
    setMessage(null);
    // Reset form to original values
    Auth.currentAuthenticatedUser().then(user => {
      const { attributes } = user;
      setFormData({
        name: attributes.name || attributes.given_name || user.username,
        email: attributes.email,
        currentPassword: '',
        newPassword: ''
      });
    });
  };

  if (isLoading && !isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="settings-page p-6 max-w-4xl mx-auto">
      <motion.h1
        className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <FaUserCog className="text-blue-600" /> User Settings
      </motion.h1>

      <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
        {message && (
          <motion.div
            className={`p-4 ${
              message.type === 'success' 
                ? 'bg-green-50 text-green-800' 
                : 'bg-red-50 text-red-800'
            }`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center">
              {message.type === 'success' ? (
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
              <span>{message.text}</span>
            </div>
          </motion.div>
        )}

        <div className="px-6 py-5">
          <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
          <p className="mt-1 text-sm text-gray-500">
            Update your account's profile information and email address.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
            <div className="sm:col-span-4">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`block w-full rounded-md shadow-sm sm:text-sm ${
                    !isEditing ? 'bg-gray-100 border-gray-300' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>

            <div className="sm:col-span-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Full Name
              </label>
              <div className="mt-1">
                <input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className={`block w-full rounded-md shadow-sm sm:text-sm ${
                    !isEditing ? 'bg-gray-100 border-gray-300' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-5">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Change Password</h2>
            <button
              type="button"
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              {isChangingPassword ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {isChangingPassword && (
            <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-4">
                <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                  Current Password
                </label>
                <div className="mt-1">
                  <input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-4">
                <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                  New Password
                </label>
                <div className="mt-1">
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500">
                  Password must be at least 8 characters long.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-gray-50 text-right">
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <FaEdit className="mr-2" />
              Edit Profile
            </button>
          ) : (
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FaTimes className="mr-2" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isLoading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2" />
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave className="mr-2" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;