import React, { useState } from 'react'
import { Navigate, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../contexts/authContext'
import { doCreateUserWithEmailAndPassword } from '../../../firebase/auth'
import { LocalAuth } from '../../../firebase/localAuth'
import { baseControlClasses } from '../../../assets/dummy'
import { Mail, Lock, Eye, EyeOff, UserPlus } from 'lucide-react'
import { useTheme } from '../../../contexts/themeContext'

const Register = () => {

    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setconfirmPassword] = useState('')
    const [isRegistering, setIsRegistering] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const { theme, toggle } = useTheme()

    const { userLoggedIn, useLocalAuth, setCurrentUser, setUserLoggedIn } = useAuth()

    const onSubmit = async (e) => {
        e.preventDefault()
        if(!isRegistering) {
            if (password !== confirmPassword) {
                setErrorMessage('Passwords do not match')
                return
            }
            setIsRegistering(true)
            setErrorMessage('')
            
            try {
                // Try local auth first for faster response
                try {
                    const user = LocalAuth.register(email, password)
                    setCurrentUser(user)
                    setUserLoggedIn(true)
                    return; // Success with local auth
                } catch (localError) {
                    // If local auth fails and we're not using local auth fallback, try Firebase
                    if (!useLocalAuth) {
                        try {
                            await doCreateUserWithEmailAndPassword(email, password)
                            return; // Success with Firebase
                        } catch (firebaseError) {
                            // If Firebase also fails, show the local auth error
                            throw localError;
                        }
                    } else {
                        // We're using local auth, so throw the local error
                        throw localError;
                    }
                }
            } catch (error) {
                console.error("Registration error:", error)
                setErrorMessage(error.message || 'Registration failed. Please try again.')
                setIsRegistering(false)
            }
        }
    }

    return (
        <>
            {userLoggedIn && (<Navigate to={'/dashboard'} replace={true} />)}

            <main className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4 relative">
                <button
                    type="button"
                    onClick={toggle}
                    className="absolute top-4 right-4 px-3 py-1.5 border rounded-md text-sm font-medium bg-white/70 dark:bg-gray-800/70 backdrop-blur border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700 transition"
                >
                    {theme === 'dark' ? 'Light' : 'Dark'}
                </button>
                <div className="w-full max-w-md bg-white dark:bg-gray-900 border border-purple-100 dark:border-gray-800 rounded-2xl shadow-lg p-6 sm:p-8">
                    <div className="text-center mb-6">
                        <Link to="/" className="inline-flex items-center justify-center gap-2">
                            <span className="text-2xl font-extrabold bg-gradient-to-r from-fuchsia-500 to-purple-600 bg-clip-text text-transparent">TaskFast</span>
                        </Link>
                        <h3 className="mt-2 text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">Create your account</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">It’s quick and easy</p>
                    </div>
                    <form onSubmit={onSubmit} className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                <Mail className="w-4 h-4 text-purple-500" /> Email
                            </label>
                            <div className="mt-2 relative">
                                <input
                                    type="email"
                                    autoComplete='email'
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className={baseControlClasses}
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                <Lock className="w-4 h-4 text-purple-500" /> Password
                            </label>
                            <div className="mt-2 relative">
                                <input
                                    disabled={isRegistering}
                                    type={showPassword ? 'text' : 'password'}
                                    autoComplete='new-password'
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className={`${baseControlClasses} pr-10`}
                                    placeholder="Create a password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    onClick={() => setShowPassword(v => !v)}
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1">
                                <Lock className="w-4 h-4 text-purple-500" /> Confirm Password
                            </label>
                            <div className="mt-2 relative">
                                <input
                                    disabled={isRegistering}
                                    type={showConfirm ? 'text' : 'password'}
                                    autoComplete='off'
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setconfirmPassword(e.target.value)}
                                    className={`${baseControlClasses} pr-10`}
                                    placeholder="Re-enter password"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-2 flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                                    onClick={() => setShowConfirm(v => !v)}
                                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                                >
                                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {errorMessage && (
                            <div className='text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-2'>
                                {errorMessage}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isRegistering}
                            className={`w-full inline-flex items-center justify-center gap-2 text-white font-medium rounded-lg py-2.5 ${isRegistering ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:shadow-md transition'}`}
                        >
                            {isRegistering ? 'Signing Up...' : (<><UserPlus className="w-4 h-4" /> Sign Up</>)}
                        </button>
                        <div className="text-sm text-center text-gray-600 dark:text-gray-400">
                            Already have an account?{' '}
                            <Link to={'/login'} className="font-semibold text-purple-600 dark:text-purple-400 hover:underline">Continue</Link>
                        </div>
                    </form>
                </div>
            </main>
        </>
    )
}

export default Register