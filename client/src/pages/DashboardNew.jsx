import { useState, useMemo } from "react"
import { useOutletContext } from "react-router-dom"
import { Plus, Home as HomeIcon, Calendar as CalendarIcon, Flame, Circle } from "lucide-react"

const Dashboard = () => {
  const context = useOutletContext() || { tasks: [], refreshTasks: () => {} }
  const { tasks = [] } = context
  const [filter, setFilter] = useState("all")

  // Calculate stats
  const stats = useMemo(() => ({
    total: tasks.length,
    lowPriority: tasks.filter(t => t.priority?.toLowerCase() === "low").length,
    mediumPriority: tasks.filter(t => t.priority?.toLowerCase() === "medium").length,
    highPriority: tasks.filter(t => t.priority?.toLowerCase() === "high").length,
    completed: tasks.filter(t => t.completed === true).length,
  }), [tasks])

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (filter === "all") return tasks
    return tasks.filter(task => {
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
  }, [tasks, filter])

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="min-w-0">
          <h1 className="text-xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <HomeIcon className="text-purple-500 w-5 h-5 md:w-6 md:h-6 shrink-0" />
            <span className="truncate">Task Dashboard</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1 ml-7 truncate">Manage your tasks efficiently</p>
        </div>
        <button 
          onClick={() => alert('Add task functionality coming soon!')} 
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
        >
          <Plus size={18} />
          Add New Task
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mb-2">
            <Circle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Tasks</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-2">
            <Circle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.completed}</div>
          <div className="text-sm text-gray-600">Completed</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-2">
            <Flame className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.highPriority}</div>
          <div className="text-sm text-gray-600">High Priority</div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mb-2">
            <Calendar className="w-4 h-4" />
          </div>
          <div className="text-2xl font-bold text-gray-800">{stats.total - stats.completed}</div>
          <div className="text-sm text-gray-600">Pending</div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-6">
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          {filter === "all" ? "All Tasks" : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Tasks`} 
          ({filteredTasks.length})
        </h2>
        
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Circle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No tasks found</p>
            <p className="text-sm">Get started by adding your first task!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredTasks.map((task) => (
              <div key={task._id || task.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-800">{task.title}</h3>
                  <p className="text-sm text-gray-600">{task.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.priority === 'high' ? 'bg-red-100 text-red-600' :
                      task.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-green-100 text-green-600'
                    }`}>
                      {task.priority || 'low'} priority
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      task.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {task.completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
