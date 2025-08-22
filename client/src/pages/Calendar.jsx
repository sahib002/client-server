import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import axios from 'axios';
import './Calendar.css';

const API_BASE = 'http://localhost:5000/api/tasks';

const CalendarPage = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await axios.get(API_BASE);
      console.log('API Response:', response.data); // Debug log
      
      // Handle both response.data.tasks and response.data directly
      const taskData = response.data.tasks || response.data || [];
      setTasks(Array.isArray(taskData) ? taskData : []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setTasks([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Map tasks to FullCalendar events
  const events = tasks.map(task => {
    try {
      // Handle different date field names and ensure valid dates
      const startDate = task.startTime || task.dueDate || new Date();
      const endDate = task.endTime || task.dueDate || new Date();
      
      // Ensure dates are valid Date objects or ISO strings
      const start = startDate instanceof Date ? startDate.toISOString() : startDate;
      const end = endDate instanceof Date ? endDate.toISOString() : endDate;
      
      return {
        id: task._id || task.id || Math.random().toString(36),
        title: task.title || 'Untitled Task',
        start: start,
        end: end,
        backgroundColor: getPriorityColor(task.priority),
        borderColor: getPriorityColor(task.priority),
        textColor: '#ffffff',
        extendedProps: {
          description: task.description || '',
          priority: task.priority || 'medium',
          completed: task.completed || false,
          taskData: task
        }
      };
    } catch (error) {
      console.error('Error mapping task to event:', task, error);
      return null; // Skip invalid tasks
    }
  }).filter(Boolean); // Remove null entries

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const handleEventClick = (clickInfo) => {
    try {
      const task = clickInfo.event.extendedProps.taskData;
      if (task) {
        setSelectedEvent(task);
      } else {
        console.error('No task data found in event');
      }
    } catch (error) {
      console.error('Error handling event click:', error);
    }
  };

  const handleDateSelect = (selectInfo) => {
    try {
      const title = prompt('Enter task title:');
      if (title) {
        const newTask = {
          title,
          description: '',
          priority: 'medium',
          dueDate: selectInfo.start.toISOString(),
          startTime: selectInfo.start.toISOString(),
          endTime: (selectInfo.end || selectInfo.start).toISOString(),
          owner: 'temp-user', // Add owner field that backend expects
          completed: false
        };
        
        createTask(newTask);
      }
      selectInfo.view.calendar.unselect();
    } catch (error) {
      console.error('Error handling date select:', error);
    }
  };

  const handleEventDrop = async (dropInfo) => {
    const { event } = dropInfo;
    const taskData = event.extendedProps.taskData;
    
    try {
      const updatedTask = {
        ...taskData,
        startTime: event.start.toISOString(),
        endTime: (event.end || event.start).toISOString(),
        dueDate: event.start.toISOString()
      };
      
      await axios.put(`${API_BASE}/${taskData._id}`, updatedTask);
      fetchTasks(); // Refresh tasks
    } catch (error) {
      console.error('Error updating task:', error);
      dropInfo.revert(); // Revert the event to its original position
    }
  };

  const handleEventResize = async (resizeInfo) => {
    const { event } = resizeInfo;
    const taskData = event.extendedProps.taskData;
    
    try {
      const updatedTask = {
        ...taskData,
        startTime: event.start.toISOString(),
        endTime: event.end.toISOString(),
        dueDate: event.start.toISOString()
      };
      
      await axios.put(`${API_BASE}/${taskData._id}`, updatedTask);
      fetchTasks(); // Refresh tasks
    } catch (error) {
      console.error('Error updating task:', error);
      resizeInfo.revert(); // Revert the event to its original size
    }
  };

  const createTask = async (taskData) => {
    try {
      await axios.post(API_BASE, taskData);
      fetchTasks(); // Refresh tasks
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const closeModal = () => {
    setSelectedEvent(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Task Calendar</h1>
          
          <div className="calendar-container">
            <FullCalendar
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay'
              }}
              events={events}
              eventClick={handleEventClick}
              select={handleDateSelect}
              eventDrop={handleEventDrop}
              eventResize={handleEventResize}
              selectable={true}
              selectMirror={true}
              dayMaxEvents={true}
              weekends={true}
              editable={true}
              droppable={true}
              height="auto"
              slotMinTime="06:00:00"
              slotMaxTime="24:00:00"
              allDaySlot={false}
              slotDuration="00:30:00"
              snapDuration="00:15:00"
              eventDisplay="block"
              eventTextColor="#ffffff"
              eventBorderWidth={1}
              dayCellClassNames="hover:bg-gray-50"
              eventClassNames="cursor-pointer hover:opacity-80 transition-opacity"
              buttonText={{
                today: 'Today',
                month: 'Month',
                week: 'Week',
                day: 'Day'
              }}
              titleFormat={{ year: 'numeric', month: 'long' }}
              dayHeaderFormat={{ weekday: 'short' }}
              slotLabelFormat={{
                hour: 'numeric',
                minute: '2-digit',
                omitZeroMinute: false,
                meridiem: 'short'
              }}
            />
          </div>
        </div>
      </div>

      {/* Task Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Task Details</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <p className="mt-1 text-sm text-gray-900">{selectedEvent.title}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900">{selectedEvent.description || 'No description'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Priority</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  selectedEvent.priority === 'high' ? 'bg-red-100 text-red-800' :
                  selectedEvent.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedEvent.priority}
                </span>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  selectedEvent.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {selectedEvent.completed ? 'Completed' : 'Pending'}
                </span>
              </div>
              
              {selectedEvent.dueDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Due Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedEvent.dueDate).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalendarPage;
