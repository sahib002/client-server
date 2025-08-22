// UI Constants and Classes
export const WRAPPER = "min-h-screen bg-gray-50 p-4 sm:p-6"
export const HEADER = "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6"
export const ADD_BUTTON = "flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
export const STATS_GRID = "grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
export const STAT_CARD = "bg-white p-4 rounded-lg shadow-sm border border-gray-200"
export const ICON_WRAPPER = "w-8 h-8 rounded-full flex items-center justify-center mb-2"
export const VALUE_CLASS = "text-2xl font-bold text-gray-800"
export const LABEL_CLASS = "text-sm text-gray-600"

export const STATS = {
  total: { label: "Total Tasks", color: "bg-blue-100 text-blue-600" },
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-600" },
  completed: { label: "Completed", color: "bg-green-100 text-green-600" },
  overdue: { label: "Overdue", color: "bg-red-100 text-red-600" }
}

export const FILTER_OPTIONS = ["all", "pending", "completed", "overdue"]
export const FILTER_LABELS = {
  all: "All Tasks",
  pending: "Pending",
  completed: "Completed", 
  overdue: "Overdue"
}

export const EMPTY_STATE = "text-center py-12 text-gray-500"
export const FILTER_WRAPPER = "flex flex-col sm:flex-row gap-4 items-start sm:items-center"
export const SELECT_CLASSES = "border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"

export const TABS_WRAPPER = "flex border-b border-gray-200 mb-6"
export const TAB_BASE = "px-4 py-2 font-medium text-sm transition-colors duration-200"
export const TAB_ACTIVE = "border-b-2 border-blue-500 text-blue-600"
export const TAB_INACTIVE = "text-gray-500 hover:text-gray-700"

// AddTask component constants
export const baseControlClasses = "w-full border border-purple-100 rounded-lg px-3 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all duration-200 text-sm"

export const priorityStyles = {
  low: "text-green-600 bg-green-50",
  medium: "text-yellow-600 bg-yellow-50", 
  high: "text-red-600 bg-red-50"
}

export const DEFAULT_TASK = {
  title: '',
  description: '',
  priority: 'low',
  dueDate: '',
  startTime: '',
  endTime: '',
  completed: 'No',
  id: null
}
