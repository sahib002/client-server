import { auth } from "./firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updatePassword,
} from "firebase/auth";

export const doCreateUserWithEmailAndPassword = async (email, password) => {
  try {
    return await createUserWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Registration error:", error);
    if (error.code === 'auth/network-request-failed') {
      throw new Error('Network connection failed. Please check your internet connection and try again.');
    }
    throw error;
  }
};

export const doSignInWithEmailAndPassword = async (email, password) => {
  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Sign-in error:", error);
    if (error.code === 'auth/network-request-failed') {
      throw new Error('Network connection failed. Please check your internet connection and try again.');
    }
    if (error.code === 'auth/user-not-found') {
      throw new Error('No account found with this email. Please register first.');
    }
    if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect password. Please try again.');
    }
    if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address format.');
    }
    throw error;
  }
};

export const doSignOut = () => {
  return auth.signOut();
};

export const doPasswordReset = (email) => {
  return sendPasswordResetEmail(auth, email);
};

export const doPasswordChange = (password) => {
  return updatePassword(auth.currentUser, password);
};

export const doSendEmailVerification = () => {
  return sendEmailVerification(auth.currentUser, {
    url: `${window.location.origin}/home`,
  });
};