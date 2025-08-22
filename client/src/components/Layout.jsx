import React, { useState, useEffect, useCallback, useMemo } from "react"
import { Outlet } from "react-router-dom"
import { Circle, TrendingUp, Clock, Zap } from "lucide-react"
import Navbar from "./Navbar"
import AgentChat from "./AgentChat"
import { useAuth } from "../contexts/authContext"
import useTasks from "../hooks/useTasks"

const Layout = ({ children }) => {
  const { currentUser } = useAuth()
  const userEmail = currentUser?.email || currentUser?.displayName || "temp-user"
  const { tasks, loading, refreshTasks } = useTasks(userEmail) // Use shared hook with user email
  const [error, setError] = useState(null)

  // Debug: track when tasks change
  useEffect(() => {
    console.log('Layout tasks from useTasks hook for user:', userEmail, 'Total tasks:', tasks.length)
  }, [tasks, userEmail])

  const contextValue = useMemo(() => ({
    tasks,
    refreshTasks
  }), [tasks, refreshTasks])

  // Calculate statistics from tasks (back to original approach but with proper refresh)
  const stats = useMemo(() => {
    console.log('📊 Layout: Calculating stats from tasks:', tasks.length, 'tasks')
    const completedTasks = tasks.filter(t => 
      t.completed === true ||
      t.completed === 1 ||
      (typeof t.completed === "string" && t.completed.toLowerCase() === "yes")
    ).length

    const totalCount = tasks.length
    const pendingCount = totalCount - completedTasks
    const completionPercentage = totalCount ? 
      Math.round((completedTasks / totalCount) * 100) : 0

    console.log('📊 Layout: Stats calculated from tasks -', { totalCount, completedTasks, pendingCount, completionPercentage })
    return {
      totalCount,
      completedTasks,
      pendingCount,
      completionPercentage
    }
  }, [tasks]) // Back to using tasks instead of directTasks

  const StatCard = ({ title, value, icon }) => (
    <div className="p-2 sm:p-3 rounded-xl bg-white shadow-sm border border-purple-100 hover:shadow-md transition-all duration-300 hover:border-purple-200 group">
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded-lg bg-gradient-to-br from-fuchsia-500/10 to-purple-500/10 group-hover:from-fuchsia-500/20 group-hover:to-purple-500/20">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-lg sm:text-xl font-bold bg-gradient-to-r from-fuchsia-500 to-purple-600 bg-clip-text text-transparent">
            {value}
          </p>
          <p className="text-xs text-gray-500 font-medium">{title}</p>
        </div>
      </div>
    </div>
  )

  if (loading) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6 flex items-center justify-center">
      <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-4 rounded-xl border border-red-100 dark:border-red-900 max-w-md">
        <p className="font-medium mb-2">Error loading tasks</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={refreshTasks}
          className="mt-4 px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-200 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Navbar hover trigger area at top of screen */}
      <div className="fixed top-0 left-0 right-0 h-4 bg-transparent z-40 hover:bg-gray-100/10"></div>
      
      <Navbar />

      <div className="pt-8 p-3 sm:p-4 md:p-4 transition-all duration-300">
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
          <div className="xl:col-span-2 space-y-3 sm:space-y-4">
            {children || <Outlet context={contextValue} />}
          </div>

          <div className="xl:col-span-1 space-y-4 sm:space-y-6">
            <div className="bg-white dark:bg-gray-900 rounded-xl p-4 sm:p-5 shadow-sm border border-purple-100 dark:border-gray-800">
              <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                Task Statistics
                <span className="text-xs text-gray-400 dark:text-gray-500 font-normal ml-auto">
                  {tasks.length > 0 ? new Date().toLocaleTimeString() : 'Loading...'}
                </span>
              </h3>

              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
                <StatCard 
                  title="Total Tasks" 
                  value={stats.totalCount} 
                  icon={<Circle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />} 
                />
                <StatCard 
                  title="Completed" 
                  value={stats.completedTasks} 
                  icon={<Circle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500" />} 
                />
                <StatCard 
                  title="Pending" 
                  value={stats.pendingCount} 
                  icon={<Circle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-fuchsia-500" />} 
                />
                <StatCard
                  title="Completion Rate"
                  value={`${stats.completionPercentage}%`}
                  icon={<Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />}
                />
              </div>

              <hr className="my-3 sm:my-4 border-purple-100 dark:border-gray-800" />

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between text-gray-700 dark:text-gray-200">
                  <span className="text-xs sm:text-sm font-medium flex items-center gap-1.5">
                    <Circle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-500 fill-purple-500" />
                    Task Progress
                  </span>
                  <span className="text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-200 px-1.5 py-0.5 sm:px-2 rounded-full">
                    {stats.completedTasks}/{stats.totalCount}
                  </span>
                </div>
                <div className="relative pt-1">
                  <div className="flex gap-1.5 items-center">
                    <div className="flex-1 h-2 sm:h-3 bg-purple-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-600 transition-all duration-500"
                        style={{ width: `${stats.completionPercentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  <AgentChat />
    </div>
  )
}

export default Layout