import { initializeApp } from 'firebase/app';
import { 
  initializeAuth,
  getReactNativePersistence,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { store } from '../store';
import { setUser, logout } from '../store/authSlice';

const firebaseConfig = {
  apiKey: "AIzaSyAfkwv0CsfzXkgHDS1tcYXGkEptxjLaUhM",
  authDomain: "fevapp-2dffb.firebaseapp.com",
  projectId: "fevapp-2dffb",
  storageBucket: "fevapp-2dffb.appspot.com",
  messagingSenderId: "632319896086",
  appId: "1:632319896086:android:96656efbaf21e049b96337"
};

const app = initializeApp(firebaseConfig);  

// Auth'u AsyncStorage ile başlat
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export const subscribeToAuthChanges = (callback) => {
  return onAuthStateChanged(auth, (user) => {
    store.dispatch(setUser(user));
    callback(user);
  });
};

export const handleSignOut = async (navigation) => {
  try {
    await signOut(auth);
    await AsyncStorage.removeItem('user');
    store.dispatch(logout());
    navigation.navigate('login/login');
  } catch (error) {
    console.error('Error signing out:', error);
  }
};

export { auth, app };
