import { API, Storage } from 'aws-amplify';

/**
 * Fetches all tasks with attachment URLs
 */
export const getTasks = async () => {
  try {
    const tasks = await API.get('taskApi', '/tasks');
    
    // Enrich tasks with attachment URLs
    const tasksWithAttachments = await Promise.all(
      tasks.map(async task => ({
        ...task,
        attachmentUrl: task.attachment 
          ? await Storage.get(task.attachment) 
          : null
      }))
    );
    
    return tasksWithAttachments;
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw new Error('Failed to load tasks');
  }
};

/**
 * Creates a new task
 */
export const addTask = async (content) => {
  try {
    const newTask = await API.post('taskApi', '/tasks', {
      body: { content }
    });
    return newTask;
  } catch (error) {
    console.error('Error adding task:', error);
    throw new Error('Failed to create task');
  }
};

/**
 * Updates a task with partial updates
 */
export const updateTask = async (taskId, updates) => {
  try {
    const updatedTask = await API.put('taskApi', `/tasks/${taskId}`, {
      body: updates
    });
    return updatedTask;
  } catch (error) {
    console.error('Error updating task:', error);
    throw new Error('Failed to update task');
  }
};

/**
 * Deletes a task and its attachment if exists
 */
export const deleteTask = async (taskId) => {
  try {
    // First get the task to check for attachments
    const task = await API.get('taskApi', `/tasks/${taskId}`);
    
    if (task?.attachment) {
      await Storage.remove(task.attachment);
    }
    
    await API.del('taskApi', `/tasks/${taskId}`);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw new Error('Failed to delete task');
  }
};

/**
 * Uploads a file attachment for a task
 */
export const uploadAttachment = async (taskId, file) => {
  try {
    const fileName = `attachments/${taskId}/${Date.now()}-${file.name}`;
    await Storage.put(fileName, file, {
      contentType: file.type,
      progressCallback: progress => {
        console.log(`Uploaded: ${progress.loaded}/${progress.total}`);
      }
    });
    return fileName;
  } catch (error) {
    console.error('Error uploading attachment:', error);
    throw new Error('File upload failed');
  }
};

/**
 * Gets task statistics
 */
export const getStats = async () => {
  try {
    const stats = await API.get('taskApi', '/stats');
    return stats;
  } catch (error) {
    console.error('Error fetching stats:', error);
    throw new Error('Failed to load statistics');
  }
};