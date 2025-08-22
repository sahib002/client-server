import React, { useContext, useState, useEffect } from "react";
import { auth } from "../../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { LocalAuth } from "../../firebase/localAuth";

const AuthContext = React.createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isEmailUser, setIsEmailUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [useLocalAuth, setUseLocalAuth] = useState(false);

  useEffect(() => {
    // Check if we have a local user first (this is instant)
    const localUser = LocalAuth.getCurrentUser();
    if (localUser) {
      setCurrentUser(localUser);
      setUserLoggedIn(true);
      setIsEmailUser(true);
      setUseLocalAuth(true);
      setLoading(false);
      return;
    }

    // Set a timeout for Firebase auth to prevent hanging
    const authTimeout = setTimeout(() => {
      console.log("Firebase auth timeout - switching to local auth");
      setUseLocalAuth(true);
      setLoading(false);
    }, 3000); // 3 second timeout

    // Try Firebase auth with timeout protection
    const unsubscribe = onAuthStateChanged(auth, 
      (user) => {
        clearTimeout(authTimeout);
        initializeUser(user);
      }, 
      (error) => {
        clearTimeout(authTimeout);
        console.error("Firebase auth error:", error);
        setUseLocalAuth(true);
        setLoading(false);
      }
    );
    
    return () => {
      clearTimeout(authTimeout);
      unsubscribe();
    };
  }, []);

  async function initializeUser(user) {
    if (user) {
      setCurrentUser({ ...user });
      setIsEmailUser(true);
      setUserLoggedIn(true);
      setUseLocalAuth(false);
    } else {
      setCurrentUser(null);
      setUserLoggedIn(false);
    }
    setLoading(false);
  }

  const value = {
    userLoggedIn,
    isEmailUser,
    currentUser,
    setCurrentUser,
    useLocalAuth,
    setUserLoggedIn
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}