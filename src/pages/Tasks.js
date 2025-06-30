import React, { useState, useEffect, useCallback } from 'react';
import { API, Storage, Auth } from 'aws-amplify';
import { motion } from 'framer-motion';
import TaskItem from '../components/TaskItem';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/App.css';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await API.get('taskApi', '/tasks');
      const tasksWithAttachments = await Promise.all(
        response.map(async task => ({
          ...task,
          attachmentUrl: task.attachment ? await Storage.get(task.attachment) : null
        }))
      );
      setTasks(tasksWithAttachments);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleTaskOperation = async (operation) => {
    try {
      await operation();
      await fetchTasks();
    } catch (error) {
      console.error('Operation failed:', error);
      setError(`Operation failed: ${error.message}`);
      throw error;
    }
  };

  const addTask = () => handleTaskOperation(async () => {
    if (!newTask.trim()) return;
    await API.post('taskApi', '/tasks', { body: { content: newTask } });
    setNewTask('');
  });

  const deleteTask = (id) => handleTaskOperation(async () => {
    const task = tasks.find(t => t.taskId === id);
    if (task?.attachment) {
      await Storage.remove(task.attachment);
    }
    await API.del('taskApi', `/tasks/${id}`);
  });

  const toggleComplete = (id, completed) => handleTaskOperation(async () => {
    await API.put('taskApi', `/tasks/${id}`, { body: { completed: !completed } });
  });

  const saveEdit = (id, content) => handleTaskOperation(async () => {
    await API.put('taskApi', `/tasks/${id}`, { body: { content } });
  });

  const handleFileUpload = async (e, taskId) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setUploadProgress(0);
      
      const user = await Auth.currentAuthenticatedUser();
      const fileName = `attachments/${user.username}/${taskId}/${Date.now()}-${file.name}`;
      
      await Storage.put(fileName, file, {
        contentType: file.type,
        progressCallback: progress => {
          setUploadProgress(Math.round((progress.loaded / progress.total) * 100));
        }
      });
      
      await API.put('taskApi', `/tasks/${taskId}`, { body: { attachment: fileName } });
    } catch (error) {
      console.error('Upload failed:', error);
      setError('File upload failed. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="tasks-page p-6 max-w-3xl mx-auto">
      <motion.h1 className="text-2xl font-bold mb-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        Your Tasks
      </motion.h1>

      {error && (
        <motion.div 
          className="p-4 mb-4 bg-red-50 text-red-700 rounded-lg cursor-pointer"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setError(null)}
        >
          {error}
        </motion.div>
      )}

      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="Add a new task..."
          className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          onKeyPress={(e) => e.key === 'Enter' && addTask()}
          disabled={uploading}
        />
        <button 
          onClick={addTask} 
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={uploading || !newTask.trim()}
        >
          Add
        </button>
      </div>

      {uploading && (
        <div className="mb-4 h-2 bg-gray-200 rounded overflow-hidden">
          <div 
            className="h-full bg-blue-600 transition-all duration-300" 
            style={{ width: `${uploadProgress}%` }}
          />
        </div>
      )}

      <div className="space-y-3">
        {tasks.length === 0 ? (
          <motion.div 
            className="p-4 text-center text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            No tasks found. Add your first task above!
          </motion.div>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.taskId}
              task={task}
              onDelete={deleteTask}
              onToggleComplete={toggleComplete}
              onSaveEdit={saveEdit}
              onFileUpload={handleFileUpload}
              disabled={uploading}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default Tasks;