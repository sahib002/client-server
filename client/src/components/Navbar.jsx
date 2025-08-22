import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/authContext'
import { useTheme } from '../contexts/themeContext'
import { doSignOut } from '../firebase/auth'

const Navbar = () => {
  const { userLoggedIn, currentUser } = useAuth()
  const { theme, toggle } = useTheme()

  const handleLogout = async () => {
    try {
      await doSignOut()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <nav className="group bg-white dark:bg-gray-900 dark:border-gray-800 shadow-lg border-b fixed top-0 w-full z-50 transform -translate-y-12 hover:translate-y-0 transition-transform duration-300 ease-in-out">
      {/* Hover trigger area */}
      <div className="absolute -bottom-4 left-0 right-0 h-4 bg-transparent"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link to="/dashboard" className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              TaskFast
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {userLoggedIn && (
                <>
                  <Link 
                    to="/dashboard" 
                    className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition duration-200"
                  >
                    Dashboard
                  </Link>
                  <Link 
                    to="/calendar" 
                    className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition duration-200"
                  >
                    Calendar
                  </Link>
                  <Link 
                    to="/home" 
                    className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium transition duration-200"
                  >
                    Home
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* User Profile / Logout */}
          {userLoggedIn && (
            <div className="flex items-center space-x-4">
              <button
                type="button"
                onClick={toggle}
                className="px-3 py-1.5 border rounded-md text-sm font-medium bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                title={theme === 'dark' ? 'Switch to light' : 'Switch to dark'}
              >
                {theme === 'dark' ? 'Light' : 'Dark'}
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-200">
                Welcome, {currentUser?.email || 'User'}
              </span>
              <button 
                className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-md text-sm font-medium transition duration-200"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
