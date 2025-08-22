import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import './Calendar.css'; // Custom styles to fix button issues
import { useAuth } from '../contexts/authContext';
import axios from 'axios';
import TaskModal from './AddTask';

const localizer = momentLocalizer(moment);
const DragAndDropCalendar = withDragAndDrop(Calendar);

const TaskCalendar = () => {
  const { currentUser } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);
  
  // Add controlled state for calendar navigation
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month');

  // Fetch tasks and convert them to calendar events
  const fetchTasksForCalendar = async () => {
    try {
      if (!currentUser?.email) {
        setLoading(false);
        return;
      }

      const response = await axios.get(`http://localhost:5000/api/tasks?userEmail=${currentUser.email}`);
      console.log('📡 Raw API response:', response.data);
      const tasks = response.data.tasks || response.data;
      console.log('📋 Processed tasks array:', tasks);

      // Convert tasks to calendar events
      const calendarEvents = tasks.map(task => {
        console.log('Processing task:', task.title, {
          startTime: task.startTime,
          endTime: task.endTime,
          dueDate: task.dueDate,
          fullTask: task
        });
        
        let startDate, endDate;
        let isAllDay = true;
        
        // If task has start and end times, use them
        if (task.startTime && task.endTime) {
          startDate = new Date(task.startTime);
          endDate = new Date(task.endTime);
          isAllDay = false;
          console.log('✅ Task has both start and end times:', startDate, endDate);
        } 
        // If task has only start time, make it 1 hour duration
        else if (task.startTime) {
          startDate = new Date(task.startTime);
          endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Add 1 hour
          isAllDay = false;
          console.log('✅ Task has only start time:', startDate, endDate);
        }
        // If task has only due date, make it all-day
        else if (task.dueDate) {
          startDate = new Date(task.dueDate);
          endDate = new Date(task.dueDate);
          isAllDay = true;
          console.log('📅 Task has only due date (all-day):', startDate);
        }
        // Default to today if no dates
        else {
          startDate = new Date();
          endDate = new Date();
          isAllDay = true;
          console.log('⚠️ Task has no dates, using today');
        }

        return {
          id: task._id,
          title: task.title || task.task,
          start: startDate,
          end: endDate,
          resource: task,
          completed: task.completed,
          allDay: isAllDay
        };
      });

      setEvents(calendarEvents);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks for calendar:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasksForCalendar();
  }, [currentUser]);

  // Custom event style getter
  const eventStyleGetter = (event) => {
    let backgroundColor = '#3174ad';
    
    if (event.completed) {
      backgroundColor = '#28a745'; // Green for completed tasks
    } else if (event.resource.priority === 'high') {
      backgroundColor = '#dc3545'; // Red for high priority
    } else if (event.resource.priority === 'medium') {
      backgroundColor = '#ffc107'; // Yellow for medium priority
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '5px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };

  // Handle event selection
  const handleSelectEvent = (event) => {
    setTaskToEdit(event.resource);
    setIsModalOpen(true);
  };

  // Handle slot selection (for creating new tasks)
  const handleSelectSlot = ({ start, end }) => {
    const startMoment = moment(start);
    const endMoment = moment(end);
    
    console.log('🎯 Slot selected:', {
      start: start,
      end: end,
      startMoment: startMoment.format('YYYY-MM-DD HH:mm'),
      endMoment: endMoment.format('YYYY-MM-DD HH:mm')
    });
    
    // Check if this is a time slot selection (not all-day)
    const isTimeSlot = startMoment.format('HH:mm') !== '00:00' || endMoment.format('HH:mm') !== '00:00';
    
    setSelectedDate(startMoment.format('YYYY-MM-DD'));
    
    // If it's a time slot, also set the time
    const taskData = { dueDate: startMoment.format('YYYY-MM-DD') };
    if (isTimeSlot) {
      taskData.startTime = startMoment.format('HH:mm');
      taskData.endTime = endMoment.format('HH:mm');
      console.log('⏰ Time slot detected:', taskData);
    } else {
      console.log('📅 All-day slot detected:', taskData);
    }
    
    setTaskToEdit(taskData);
    setIsModalOpen(true);
  };

  // Handle task save from modal
  const handleTaskSave = () => {
    fetchTasksForCalendar(); // Refresh calendar data
    setIsModalOpen(false);
    setTaskToEdit(null);
    setSelectedDate(null);
  };

  // Handle drag and drop events
  const handleEventDrop = async ({ event, start, end }) => {
    try {
      console.log('Dragging task:', event.title, 'to new date/time:', start, 'to', end);
      // Normalize zero-length or inverted ranges (can happen on quick resize/drag)
      let startDate = new Date(start);
      let endDate = new Date(end);
      if (!endDate || endDate <= startDate) {
        // default to +60 minutes
        endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
        console.log('⏱️ Adjusted zero-length range ->', startDate, 'to', endDate);
      }

      const hasTime = (d) => d.getHours() !== 0 || d.getMinutes() !== 0 || d.getSeconds() !== 0 || d.getMilliseconds() !== 0;
      const newAllDay = !(hasTime(startDate) || hasTime(endDate));
      
      const updatedTask = {
        title: event.resource.title,
        description: event.resource.description,
        priority: event.resource.priority,
        completed: event.resource.completed,
        dueDate: moment(startDate).format('YYYY-MM-DD'),
        userEmail: currentUser?.email
      };
      
      // If all-day, clear times; else set precise times
      if (newAllDay) {
        updatedTask.startTime = null;
        updatedTask.endTime = null;
      } else if (event.resource.startTime || event.resource.endTime || !newAllDay) {
        updatedTask.startTime = startDate;
        updatedTask.endTime = endDate;
      }

      const response = await axios.put(`http://localhost:5000/api/tasks/${event.id}`, updatedTask);
      
      if (response.data.success || response.data.task) {
        // Update the event in local state
        setEvents(prevEvents => 
          prevEvents.map(evt => 
            evt.id === event.id 
              ? { 
                  ...evt, 
                  start: startDate, 
                  end: endDate, 
                  allDay: newAllDay,
                  resource: { 
                    ...evt.resource, 
                    dueDate: startDate,
                    startTime: newAllDay ? undefined : startDate,
                    endTime: newAllDay ? undefined : endDate 
                  } 
                }
              : evt
          )
        );
        console.log('✅ Task date/time updated successfully');
        
        // Show success feedback
        const timeInfo = newAllDay ? 
          moment(startDate).format('MMM DD, YYYY') : 
          `${moment(startDate).format('MMM DD, YYYY h:mm A')} - ${moment(endDate).format('h:mm A')}`;
        alert(`Task "${event.title}" moved to ${timeInfo}`);
      }
    } catch (error) {
      console.error('❌ Error updating task date/time:', error);
      alert('Failed to update task date/time. Please try again.');
      // Refresh calendar to revert changes
      fetchTasksForCalendar();
    }
  };

  // Handle event resize (if user drags to extend the duration)
  const handleEventResize = async ({ event, start, end }) => {
  // Resize should preserve the new start and end from the resize action
  await handleEventDrop({ event, start, end });
  };

  // Handle navigation events
  const handleNavigate = useCallback((newDate) => {
    console.log('📅 Navigating to date:', newDate);
    setCurrentDate(newDate);
  }, []);

  const handleViewChange = useCallback((newView) => {
    console.log('👁️ Changing view to:', newView);
    setCurrentView(newView);
  }, []);

  // Handle toolbar button clicks
  const handleToday = useCallback(() => {
    console.log('🏠 Going to today');
    setCurrentDate(new Date());
  }, []);

  const handleNext = useCallback(() => {
    console.log('⏭️ Going to next period');
    const nextDate = moment(currentDate).add(1, currentView === 'month' ? 'month' : currentView === 'week' ? 'week' : 'day').toDate();
    setCurrentDate(nextDate);
  }, [currentDate, currentView]);

  const handlePrevious = useCallback(() => {
    console.log('⏮️ Going to previous period');
    const prevDate = moment(currentDate).subtract(1, currentView === 'month' ? 'month' : currentView === 'week' ? 'week' : 'day').toDate();
    setCurrentDate(prevDate);
  }, [currentDate, currentView]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg border border-purple-100 dark:border-gray-800">
      <h2 className="text-2xl font-bold mb-4 text-gray-800 dark:text-gray-100">Task Calendar</h2>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        💡 <strong>Tip:</strong> Drag tasks to different dates to update their due dates, or click to edit them.
      </p>
      <div style={{ height: '600px' }}>
        <DragAndDropCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          onSelectSlot={handleSelectSlot}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          
          // Controlled navigation props
          date={currentDate}
          view={currentView}
          onNavigate={handleNavigate}
          onView={handleViewChange}
          
          // Custom toolbar to ensure buttons work
          components={{
            toolbar: ({ label, onNavigate, onView, view, views }) => (
              <div className="rbc-toolbar">
                <div className="rbc-btn-group">
                  <button 
                    type="button"
                    onClick={() => onNavigate('PREV')}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    Previous
                  </button>
                  <button 
                    type="button"
                    onClick={() => onNavigate('TODAY')}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    Today
                  </button>
                  <button 
                    type="button"
                    onClick={() => onNavigate('NEXT')}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    Next
                  </button>
                </div>
                
                <span className="rbc-toolbar-label">{label}</span>
                
                <div className="rbc-btn-group">
                  {views.map(viewName => (
                    <button
                      key={viewName}
                      type="button"
                      className={view === viewName ? 'rbc-active' : ''}
                      onClick={() => onView(viewName)}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {viewName.charAt(0).toUpperCase() + viewName.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            )
          }}
          
          selectable
          resizable
          popup
          dragFromOutsideItem={() => ({})}
          views={['month', 'week', 'day', 'agenda']}
          step={60}
          showMultiDayTimes
          messages={{
            next: 'Next',
            previous: 'Previous',
            today: 'Today',
            month: 'Month',
            week: 'Week',
            day: 'Day',
            agenda: 'Agenda',
            date: 'Date',
            time: 'Time',
            event: 'Task',
            noEventsInRange: 'No tasks in this date range.',
            showMore: total => `+${total} more`
          }}
        />
      </div>
      
  {/* Legend */}
  <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-700 dark:text-gray-300">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Completed Tasks</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>High Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Medium Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Normal Priority</span>
        </div>
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setTaskToEdit(null);
          setSelectedDate(null);
        }}
        taskToEdit={taskToEdit ? { 
          ...taskToEdit, 
          dueDate: selectedDate || taskToEdit.dueDate,
          startTime: taskToEdit.startTime,
          endTime: taskToEdit.endTime
        } : { 
          dueDate: selectedDate 
        }}
        onSave={handleTaskSave}
      />
    </div>
  );
};

export default TaskCalendar;
