import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../secrets/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Async thunk for user login
export const loginUser = createAsyncThunk('auth/loginUser', async ({ email, password }, ThunkAPI) => { //firebase ile asenkron bir işlem yapılıyor.
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password); // firebase ile auth işlemi yapılıyor..
    
    return userCredential.user;
  } catch (error) {
    return ThunkAPI.rejectWithValue(error.message);
  }
});

// Yeni async thunk ekleyelim
export const loadStoredUser = createAsyncThunk('auth/loadStoredUser', async () => {
  const storedUser = await AsyncStorage.getItem('user');
  return storedUser ? JSON.parse(storedUser) : null;
});

// Add new async thunk for signup
export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async ({ email, password, navigation }, thunkAPI) => {
    try {
      // Create user in Firebase
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Save user to AsyncStorage (dehydration)
      await AsyncStorage.setItem('user', JSON.stringify(user));
      
      // Navigate after successful signup
      navigation.navigate('login/login');
      
      return user;
    } catch (error) {
      let errorMessage = 'Registration failed';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'This email is already registered';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Invalid email address';
          break;
        case 'auth/weak-password':
          errorMessage = 'Password should be at least 6 characters';
          break;
        default:
          errorMessage = error.message;
      }
      
      return thunkAPI.rejectWithValue(errorMessage);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: false,
    error: null,
    status: 'idle'
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.user = null;
      state.error = null;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.status = 'pending';
        state.error = null;
        state.user = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'fulfilled';
        state.user = action.payload;
        // Kullanıcıyı AsyncStorage'a kaydet
        AsyncStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.payload;
        state.user = null;
      })
      .addCase(loadStoredUser.fulfilled, (state, action) => {
        state.user = action.payload;
        state.loading = false;
      })
      // Add cases for signup
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.status = 'pending';
        state.error = null;
      })
      .addCase(signupUser.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'fulfilled';
        state.user = action.payload;
        state.error = null;
      })
      .addCase(signupUser.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const { 
  setUser, 
  setLoading, 
  setError, 
  clearError, 
  logout, 
  setStatus 
} = authSlice.actions;

export default authSlice.reducer; 