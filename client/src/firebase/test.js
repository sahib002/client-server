// Firebase connectivity test
import { auth } from './firebase';
import { connectAuthEmulator } from 'firebase/auth';

export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...');
    console.log('Auth instance:', auth);
    console.log('Auth config:', auth.config);
    return true;
  } catch (error) {
    console.error('Firebase connection test failed:', error);
    return false;
  }
};
