import { useState, useEffect, useCallback } from 'react'

// Global task state that can be shared across components
let globalTasks = []
let globalListeners = []

const useTasks = () => {
  const [tasks, setTasks] = useState(globalTasks)
  const [loading, setLoading] = useState(true)

  // Register this component as a listener for task updates
  useEffect(() => {
    const updateTasks = (newTasks) => {
      setTasks(newTasks)
    }
    
    globalListeners.push(updateTasks)
    
    return () => {
      globalListeners = globalListeners.filter(listener => listener !== updateTasks)
    }
  }, [])

  // Function to notify all listeners when tasks change
  const notifyListeners = useCallback((newTasks) => {
    globalTasks = newTasks
    globalListeners.forEach(listener => listener(newTasks))
  }, [])

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    console.log('🔄 useTasks: Fetching tasks from API...')
    setLoading(true)
    
    try {
      const response = await fetch('http://localhost:5000/api/tasks')
      if (response.ok) {
        const data = await response.json()
        const tasksArray = data.tasks || []
        console.log('✅ useTasks: Fetched', tasksArray.length, 'tasks - notifying all components')
        notifyListeners(tasksArray)
      } else {
        console.error('❌ useTasks: API error')
      }
    } catch (err) {
      console.error('❌ useTasks: Fetch failed:', err)
    } finally {
      setLoading(false)
    }
  }, [notifyListeners])

  // Initialize tasks on first mount
  useEffect(() => {
    if (globalTasks.length === 0) {
      fetchTasks()
    } else {
      setLoading(false)
    }
  }, [fetchTasks])

  // Refresh function that can be called from any component
  const refreshTasks = useCallback(() => {
    console.log('🔄 useTasks: Manual refresh requested')
    fetchTasks()
  }, [fetchTasks])

  return {
    tasks,
    loading,
    refreshTasks,
    fetchTasks
  }
}

export default useTasks
