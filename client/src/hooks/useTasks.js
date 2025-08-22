import { useState, useEffect, useCallback } from 'react'

// Global task state that can be shared across components
let globalTasks = []
let globalListeners = []
let currentUserEmail = null

const useTasks = (userEmail = null) => {
  const [tasks, setTasks] = useState(globalTasks)
  const [loading, setLoading] = useState(true)

  // Update current user email when it changes
  useEffect(() => {
    if (userEmail && userEmail !== currentUserEmail) {
      currentUserEmail = userEmail
      // Clear tasks and refetch for new user
      globalTasks = []
      fetchTasks()
    }
  }, [userEmail])

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

  // Fetch tasks from API with user filtering
  const fetchTasks = useCallback(async () => {
    console.log('🔄 useTasks: Fetching tasks from API for user:', currentUserEmail || 'all users')
    setLoading(true)
    
    try {
      // Add userEmail to query if available
      const url = currentUserEmail 
        ? `http://localhost:5000/api/tasks?userEmail=${encodeURIComponent(currentUserEmail)}`
        : 'http://localhost:5000/api/tasks'
        
      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        const tasksArray = data.tasks || []
        console.log('✅ useTasks: Fetched', tasksArray.length, 'tasks for user:', currentUserEmail)
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
    if (globalTasks.length === 0 || currentUserEmail) {
      fetchTasks()
    } else {
      setLoading(false)
    }
  }, [fetchTasks])

  // No global event listeners; rely on existing refresh paths
  useEffect(() => {}, [])

  // Refresh function that can be called from any component
  const refreshTasks = useCallback(() => {
    console.log('🔄 useTasks: Manual refresh requested for user:', currentUserEmail)
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
