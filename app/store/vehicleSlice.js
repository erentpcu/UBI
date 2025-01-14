import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../secrets/auth';

// Async Thunks
export const fetchVehicles = createAsyncThunk(
  'vehicles/fetchVehicles',
  async (_, { rejectWithValue }) => {
    try {
      const carsCollection = collection(db, 'cars');
      const querySnapshot = await getDocs(carsCollection);
      const vehicles = [];
      
      querySnapshot.forEach((doc) => {
        vehicles.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return vehicles;
    } catch (error) {
      return rejectWithValue('Error fetching vehicles');
    }
  }
);

export const addVehicle = createAsyncThunk(
  'vehicles/addVehicle',
  async (vehicleData, { rejectWithValue }) => {
    try {
      const carsCollection = collection(db, 'cars');
      const docRef = await addDoc(carsCollection, vehicleData);
      return { id: docRef.id, ...vehicleData };
    } catch (error) {
      return rejectWithValue('Error adding vehicle');
    }
  }
);

export const updateVehicle = createAsyncThunk(
  'vehicles/updateVehicle',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const vehicleRef = doc(db, 'cars', id);
      await updateDoc(vehicleRef, data);
      return { id, ...data };
    } catch (error) {
      return rejectWithValue('Error updating vehicle');
    }
  }
);

export const deleteVehicle = createAsyncThunk(
  'vehicles/deleteVehicle',
  async (id, { rejectWithValue }) => {
    try {
      const vehicleRef = doc(db, 'cars', id);
      await deleteDoc(vehicleRef);
      return id;
    } catch (error) {
      return rejectWithValue('Error deleting vehicle');
    }
  }
);

const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState: {
    vehicles: [],
    loading: false,
    error: null,
    status: 'idle'
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Vehicles
      .addCase(fetchVehicles.pending, (state) => {
        state.loading = true;
        state.status = 'pending';
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'fulfilled';
        state.vehicles = action.payload;
        state.error = null;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Add Vehicle
      .addCase(addVehicle.pending, (state) => {
        state.loading = true;
        state.status = 'pending';
      })
      .addCase(addVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'fulfilled';
        state.vehicles.push(action.payload);
      })
      .addCase(addVehicle.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Update Vehicle
      .addCase(updateVehicle.pending, (state) => {
        state.loading = true;
        state.status = 'pending';
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'fulfilled';
        const index = state.vehicles.findIndex(v => v.id === action.payload.id);
        if (index !== -1) {
          state.vehicles[index] = action.payload;
        }
      })
      .addCase(updateVehicle.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.payload;
      })
      
      // Delete Vehicle
      .addCase(deleteVehicle.pending, (state) => {
        state.loading = true;
        state.status = 'pending';
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.loading = false;
        state.status = 'fulfilled';
        state.vehicles = state.vehicles.filter(v => v.id !== action.payload);
      })
      .addCase(deleteVehicle.rejected, (state, action) => {
        state.loading = false;
        state.status = 'failed';
        state.error = action.payload;
      });
  }
});

export const { clearError, setStatus } = vehicleSlice.actions;
export default vehicleSlice.reducer;
