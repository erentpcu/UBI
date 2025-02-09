import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import BleManager from 'react-native-ble-manager';

// Async Thunks
export const initializeBluetooth = createAsyncThunk(
  'connection/initializeBluetooth',
  async (_, { rejectWithValue }) => {
    try {
      await BleManager.start({ showAlert: false });
      return true;
    } catch (error) {
      return rejectWithValue(error.message || 'Bluetooth initialization failed');
    }
  }
);

export const scanDevices = createAsyncThunk(
  'connection/scanDevices',
  async (_, { rejectWithValue }) => {
    try {
      await BleManager.scan([], 5, true);
      return true;
    } catch (error) {
      return rejectWithValue(error.message || 'Scan failed');
    }
  }
);

export const connectToDevice = createAsyncThunk(
  'connection/connectToDevice',
  async (device, { rejectWithValue }) => {
    try {
      await BleManager.connect(device.id);
      return {
        name: device.name || `Device (${device.id})`,
        status: 'Connected',
        signalStrength: `${device.rssi} dBm`,
        deviceId: device.id,
        attributes: [
          { key: 'Signal Strength', value: `${device.rssi} dBm` },
          { key: 'Device ID', value: device.id },
          { key: 'Device Name', value: device.name || 'Unknown' }
        ]
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Connection failed');
    }
  }
);

const connectionSlice = createSlice({
  name: 'connection',
  initialState: {
    isBluetoothReady: false,
    isScanning: false,
    devices: [],
    connectedDevice: null,
    scanStatus: '',
    error: null,
    loading: false
  },
  reducers: {
    addDiscoveredDevice: (state, action) => {
      const device = action.payload;
      if (!state.devices.some(d => d.id === device.id)) {
        state.devices.push(device);
      }
    },
    clearDevices: (state) => {
      state.devices = [];
    },
    setScanStatus: (state, action) => {
      state.scanStatus = action.payload;
    },
    setIsScanning: (state, action) => {
      state.isScanning = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Initialize Bluetooth
      .addCase(initializeBluetooth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeBluetooth.fulfilled, (state) => {
        state.loading = false;
        state.isBluetoothReady = true;
        state.scanStatus = 'Bluetooth ready';
      })
      .addCase(initializeBluetooth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.scanStatus = 'Bluetooth initialization failed';
      })

      // Scan Devices
      .addCase(scanDevices.pending, (state) => {
        state.isScanning = true;
        state.scanStatus = 'Scanning for devices...';
        state.devices = [];
      })
      .addCase(scanDevices.fulfilled, (state) => {
        state.isScanning = false;
        state.scanStatus = `${state.devices.length} devices found`;
      })
      .addCase(scanDevices.rejected, (state, action) => {
        state.isScanning = false;
        state.error = action.payload;
        state.scanStatus = 'Scan failed';
      })

      // Connect to Device
      .addCase(connectToDevice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(connectToDevice.fulfilled, (state, action) => {
        state.loading = false;
        state.connectedDevice = action.payload;
        state.scanStatus = 'Connection successful!';
      })
      .addCase(connectToDevice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.scanStatus = 'Connection failed';
      });
  }
});

export const { 
  addDiscoveredDevice, 
  clearDevices, 
  setScanStatus, 
  setIsScanning 
} = connectionSlice.actions;

export default connectionSlice.reducer;
