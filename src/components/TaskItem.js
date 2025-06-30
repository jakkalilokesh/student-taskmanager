import React, { useState } from 'react';
import { FaTrash, FaCheck, FaEdit, FaPaperclip } from 'react-icons/fa';
import { motion } from 'framer-motion';
import '../styles/App.css';

const TaskItem = ({ 
  task, 
  onDelete, 
  onToggleComplete,
  onSaveEdit,
  onFileUpload,
  disabled
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.content);

  const handleSave = () => {
    if (editText.trim()) {
      onSaveEdit(task.taskId, editText);
      setIsEditing(false);
    }
  };

  return (
    <motion.div
      className={`task-item ${task.completed ? 'completed' : ''}`}
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="task-content">
        {isEditing ? (
          <input
            type="text"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="edit-input"
            onKeyPress={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
          />
        ) : (
          <span>{task.content}</span>
        )}
        
        {task.attachmentUrl && (
          <div className="task-attachment">
            <a 
              href={task.attachmentUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="attachment-link"
            >
              <FaPaperclip size={14} /> View File
            </a>
          </div>
        )}
      </div>
      
      <div className="task-actions">
        {isEditing ? (
          <>
            <button 
              onClick={handleSave} 
              className="task-btn save"
              disabled={disabled || !editText.trim()}
              title="Save changes"
            >
              <FaCheck />
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="task-btn cancel"
              disabled={disabled}
              title="Cancel"
            >
              ×
            </button>
          </>
        ) : (
          <>
            <input
              type="file"
              id={`file-upload-${task.taskId}`}
              onChange={(e) => onFileUpload(e, task.taskId)}
              style={{ display: 'none' }}
              disabled={disabled}
            />
            <label 
              htmlFor={`file-upload-${task.taskId}`} 
              className={`task-btn attach ${disabled ? 'disabled' : ''}`}
              title="Attach file"
            >
              <FaPaperclip size={14} />
            </label>
            
            <button 
              onClick={() => {
                setEditText(task.content);
                setIsEditing(true);
              }} 
              className="task-btn edit"
              disabled={disabled}
              title="Edit task"
            >
              <FaEdit size={14} />
            </button>
            
            <button 
              onClick={() => onToggleComplete(task.taskId, task.completed)} 
              className={`task-btn complete ${task.completed ? 'active' : ''}`}
              disabled={disabled}
              title={task.completed ? 'Mark incomplete' : 'Mark complete'}
            >
              <FaCheck size={14} />
            </button>
            
            <button 
              onClick={() => onDelete(task.taskId)} 
              className="task-btn delete"
              disabled={disabled}
              title="Delete task"
            >
              <FaTrash size={14} />
            </button>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default TaskItem;