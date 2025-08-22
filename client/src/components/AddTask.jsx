// components/TaskModal.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, X, Save, Calendar, AlignLeft, Flag, CheckCircle, Clock } from 'lucide-react';
import { baseControlClasses, priorityStyles, DEFAULT_TASK } from '../assets/dummy';
import TimePicker from './TimePicker';
import { useAuth } from '../contexts/authContext';

const API_BASE = 'http://localhost:5000/api/tasks';

const TaskModal = ({ isOpen, onClose, taskToEdit, onSave, onLogout }) => {
  const { currentUser } = useAuth();
  const userEmail = currentUser?.email || currentUser?.displayName || "temp-user";
  
  const [taskData, setTaskData] = useState(DEFAULT_TASK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const today = new Date().toISOString().split('T')[0];

  // Helper to add minutes to an HH:MM string
  const addMinutes = (timeStr, mins) => {
    if (!timeStr) return '';
    const [hh, mm] = timeStr.split(':').map(Number);
    const base = new Date(2000, 0, 1, hh, mm, 0, 0);
    const out = new Date(base.getTime() + mins * 60000);
    const H = String(out.getHours()).padStart(2, '0');
    const M = String(out.getMinutes()).padStart(2, '0');
    return `${H}:${M}`;
  };

  useEffect(() => {
    if (!isOpen) return;
    if (taskToEdit) {
      const normalized = taskToEdit.completed === 'Yes' || taskToEdit.completed === true ? 'Yes' : 'No';
      
      // Handle time extraction more carefully
      let startTimeStr = '';
      let endTimeStr = '';
      
      if (taskToEdit.startTime) {
        const startDate = new Date(taskToEdit.startTime);
        if (!isNaN(startDate.getTime())) {
          startTimeStr = startDate.toTimeString().slice(0, 5); // HH:MM format
        }
      }
      
      if (taskToEdit.endTime) {
        const endDate = new Date(taskToEdit.endTime);
        if (!isNaN(endDate.getTime())) {
          endTimeStr = endDate.toTimeString().slice(0, 5); // HH:MM format
        }
      }
      
      console.log('🔄 Editing task:', {
        title: taskToEdit.title,
        startTime: taskToEdit.startTime,
        endTime: taskToEdit.endTime,
        extractedStart: startTimeStr,
        extractedEnd: endTimeStr
      });
      
      setTaskData({
        ...DEFAULT_TASK,
        title: taskToEdit.title || '',
        description: taskToEdit.description || '',
        priority: taskToEdit.priority || 'low',
        dueDate: taskToEdit.dueDate?.split('T')[0] || '',
        startTime: startTimeStr,
        endTime: endTimeStr,
        completed: normalized,
        id: taskToEdit._id,
      });
    } else {
      setTaskData(DEFAULT_TASK);
    }
    setError(null);
  }, [isOpen, taskToEdit]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setTaskData(prev => ({ ...prev, [name]: value }));
  }, []);

  const getHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json',
    };
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (taskData.dueDate < today) {
      setError('Due date cannot be in the past.');
      return;
    }
    
    // Validate time fields if provided
    if (taskData.startTime && taskData.endTime && taskData.startTime >= taskData.endTime) {
      setError('End time must be after start time.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const isEdit = Boolean(taskData.id);
      const url = isEdit ? `${API_BASE}/${taskData.id}` : `${API_BASE}`;
      
      // Prepare data with proper date/time formatting
      const submitData = {
        ...taskData,
        completed: taskData.completed === 'Yes',
        userEmail: userEmail
      };
      
      console.log('📝 Form data before conversion:', {
        startTime: taskData.startTime,
        endTime: taskData.endTime,
        dueDate: taskData.dueDate
      });
      
      // Convert time fields to full datetime if provided and not empty
      if (taskData.startTime && taskData.startTime.trim() !== '' && taskData.dueDate) {
        const startDateTime = `${taskData.dueDate}T${taskData.startTime}:00`;
        const startDateObj = new Date(startDateTime);
        submitData.startTime = startDateObj.toISOString();
        console.log('✅ Created startTime:', submitData.startTime, 'from:', startDateTime);
      } else {
        // Explicitly remove startTime if not provided
        delete submitData.startTime;
        console.log('❌ No startTime provided');
      }
      
      if (taskData.endTime && taskData.endTime.trim() !== '' && taskData.dueDate) {
        const endDateTime = `${taskData.dueDate}T${taskData.endTime}:00`;
        const endDateObj = new Date(endDateTime);
        submitData.endTime = endDateObj.toISOString();
        console.log('✅ Created endTime:', submitData.endTime, 'from:', endDateTime);
      } else {
        // Explicitly remove endTime if not provided
        delete submitData.endTime;
        console.log('❌ No endTime provided');
      }
      
      console.log('📤 Final submit data:', submitData);
      
      const resp = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: getHeaders(),
        body: JSON.stringify(submitData),
      });
      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.message || 'Failed to save task');
      }
      const saved = await resp.json();
      onSave?.(saved);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, [taskData, today, getHeaders, onSave, onClose, userEmail]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-purple-100 rounded-xl max-w-md w-full shadow-lg p-6 relative animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {taskData.id ? <Save className="text-purple-500 w-5 h-5" /> : <PlusCircle className="text-purple-500 w-5 h-5" />}
            {taskData.id ? 'Edit Task' : 'Create New Task'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-purple-100 rounded-lg transition-colors text-gray-500 hover:text-purple-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
            <div className="flex items-center border border-purple-100 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-purple-500 focus-within:border-purple-500 transition-all duration-200">
              <input
                type="text" name="title" required value={taskData.title} onChange={handleChange}
                className="w-full focus:outline-none text-sm" placeholder="Enter task title"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
              <AlignLeft className="w-4 h-4 text-purple-500" /> Description
            </label>
            <textarea name="description" rows="3" value={taskData.description} onChange={handleChange}
              className={baseControlClasses} placeholder="Add details about your task" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Flag className="w-4 h-4 text-purple-500" /> Priority
              </label>
              <select name="priority" value={taskData.priority} onChange={handleChange}
                className={`${baseControlClasses} ${priorityStyles[taskData.priority]}`}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Calendar className="w-4 h-4 text-purple-500" /> Due Date
              </label>
              <input type="date" name="dueDate" required min={today} value={taskData.dueDate}
                onChange={handleChange} className={baseControlClasses} />
            </div>
          </div>
          
          {/* Time Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Clock className="w-4 h-4 text-purple-500" /> Start Time (Optional)
              </label>
              <TimePicker
                id="start-time"
                name="startTime"
                value={taskData.startTime}
                onChange={(val) => setTaskData(prev => {
                  const next = { ...prev, startTime: val };
                  if (val) {
                    // If no end time or end is <= start, suggest +60 minutes
                    if (!prev.endTime || prev.endTime <= val) {
                      next.endTime = addMinutes(val, 60);
                    }
                  }
                  return next;
                })}
                className={baseControlClasses}
                placeholder="Select start time"
                step={15}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                <Clock className="w-4 h-4 text-purple-500" /> End Time (Optional)
              </label>
              <TimePicker
                id="end-time"
                name="endTime"
                value={taskData.endTime}
                onChange={(val) => setTaskData(prev => ({ ...prev, endTime: val }))}
                className={baseControlClasses}
                placeholder="Select end time"
                step={15}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <CheckCircle className="w-4 h-4 text-purple-500" /> Status
            </label>
            <div className="flex gap-4">
              {[{ val: 'Yes', label: 'Completed' }, { val: 'No', label: 'In Progress' }].map(({ val, label }) => (
                <label key={val} className="flex items-center">
                  <input type="radio" name="completed" value={val} checked={taskData.completed === val}
                    onChange={handleChange} className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded" />
                  <span className="ml-2 text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-medium py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-md transition-all duration-200"
          >
            {loading ? 'Saving...' : (taskData.id ? <><Save className="w-4 h-4" /> Update Task</> : <><PlusCircle className="w-4 h-4" /> Create Task</>)}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
