import { useState, useMemo, useEffect } from "react"
import { useOutletContext, Link } from "react-router-dom"
import { Plus, Home as HomeIcon, Calendar, Flame, Circle, Trash2, Edit3 } from "lucide-react"
import TaskModal from "../components/AddTask"
import useTasks from "../hooks/useTasks"
import { useAuth } from "../contexts/authContext"

const Dashboard = () => {
  const { currentUser } = useAuth()
  const userEmail = currentUser?.email || currentUser?.displayName || "temp-user"
  
  const context = useOutletContext() || { tasks: [], refreshTasks: () => console.log('No refresh function available') }
  const { tasks: contextTasks = [], refreshTasks: contextRefresh } = context
  
  // Use the shared tasks hook for consistent data with user email
  const { tasks: sharedTasks, refreshTasks: sharedRefresh } = useTasks(userEmail)
  
  // Use shared tasks as the primary data source
  const tasks = sharedTasks
  console.log('🎯 Dashboard - Using shared tasks for user:', userEmail, 'Total tasks:', tasks.length)
  
  const [filter, setFilter] = useState("all")
  const [showModal, setShowModal] = useState(false)
  const [taskToEdit, setTaskToEdit] = useState(null)

  // Calculate stats from shared tasks (same data displayed in the table)
  const stats = useMemo(() => ({
    total: tasks.length,
    lowPriority: tasks.filter(t => t.priority?.toLowerCase() === "low").length,
    mediumPriority: tasks.filter(t => t.priority?.toLowerCase() === "medium").length,
    highPriority: tasks.filter(t => t.priority?.toLowerCase() === "high").length,
    completed: tasks.filter(t => t.completed === true).length,
  }), [tasks])

  // Filter tasks using shared tasks
  const filteredTasks = useMemo(() => {
    console.log('🔍 Filtering tasks - total:', tasks.length, 'filter:', filter)
    if (filter === "all") return tasks
    const filtered = tasks.filter(task => {
      switch (filter) {
        case "high":
        case "medium": 
        case "low":
          return task.priority?.toLowerCase() === filter
        case "completed":
          return task.completed === true
        case "pending":
          return task.completed === false
        default:
          return true
      }
    })
    console.log('✅ Filtered result:', filtered.length, 'tasks')
    return filtered
  }, [tasks, filter])

  // Handle task operations
  const handleAddTask = () => {
    setTaskToEdit(null)
    setShowModal(true)
  }

  const handleEditTask = (task) => {
    setTaskToEdit(task)
    setShowModal(true)
  }

  const handleTaskSave = async (savedTask) => {
    console.log('✅ Task saved, refreshing shared tasks...')
    
    // Use the shared refresh function to update all components
    sharedRefresh()
    
    setShowModal(false)
    setTaskToEdit(null)
  }

  const handleDeleteTask = async (taskId, taskTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${taskTitle}"?`)) {
      return
    }
    try {
      console.log('Deleting task:', taskId, 'for user:', userEmail)
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}?userEmail=${encodeURIComponent(userEmail)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      if (response.ok) {
        console.log('🗑️ Task deleted successfully, refreshing shared tasks...')
        // Use the shared refresh function to update all components
        sharedRefresh()
      } else {
        const error = await response.json()
        console.error('Failed to delete task:', error)
        alert(error.message || 'Failed to delete task. Please try again.')
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      alert('Error deleting task. Please try again.')
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setTaskToEdit(null)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <HomeIcon className="text-purple-500 w-5 h-5 md:w-6 md:h-6 shrink-0" />
            <span className="truncate">Task Dashboard</span>
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 ml-7 truncate">Manage your tasks efficiently</p>
        </div>
        <div className="flex gap-2">
          <Link 
            to="/calendar"
            className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-2 rounded-lg hover:from-green-600 hover:to-teal-700 transition-all duration-200"
          >
            <Calendar size={18} />
            View Calendar
          </Link>
          <button 
            onClick={handleAddTask} 
            className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            <Plus size={18} />
            Add New Task
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
            <Circle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.total}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Tasks</div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-2">
            <Circle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.completed}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Completed</div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-2">
            <Flame className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.highPriority}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">High Priority</div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800">
          <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mb-2">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">{stats.total - stats.completed}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
        </div>
      </div>

      {/* Filter Controls */}
    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
      className="border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Tasks</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
      </div>

      {/* Tasks List */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
          {filter === "all" ? "All Tasks" : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Tasks`} 
          ({filteredTasks.length})
        </h2>
        
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <Circle className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-700" />
            <p className="text-lg font-medium text-gray-800 dark:text-gray-200">No tasks found</p>
            <p className="text-sm">Get started by adding your first task!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div 
                key={task._id || task.id} 
                className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-800 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800 dark:text-gray-100">{task.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{task.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.priority === 'high' ? 'bg-red-100 text-red-600' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {task.priority || 'low'} priority
                    </span>
                    {task.completed && (
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-600">
                        Completed
                      </span>
                    )}
                    {task.dueDate && (
                      <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditTask(task)
                    }}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Edit task"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteTask(task._id || task.id, task.title)
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Modal */}
  <TaskModal
        isOpen={showModal}
        onClose={handleCloseModal}
        taskToEdit={taskToEdit}
        onSave={handleTaskSave}
      />
    </div>
  )
}

export default Dashboard
