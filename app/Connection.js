import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, Platform, Modal, ScrollView, Alert } from 'react-native';
import { Feather } from '@expo/vector-icons';
import BleManager from 'react-native-ble-manager';
import { NativeEventEmitter, NativeModules, PermissionsAndroid } from 'react-native';
import { auth, handleSignOut } from './secrets/auth';
import { useNavigation } from '@react-navigation/native';
import { useSelector, useDispatch } from 'react-redux';
import VehicleDataScreen from './VehicleDataScreen';
import ProfileScreen from './ProfileScreen';
import { ProtectedRoute } from './ProtectedRoute';
import { addVehicle } from './store/vehicleSlice';
import {
  initializeBluetooth,
  scanDevices,
  connectToDevice,
  addDiscoveredDevice,
  clearDevices,
  setScanStatus,
  setIsScanning
} from './store/connectionSlice';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

function Connection() {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const [currentScreen, setCurrentScreen] = useState('bluetooth');
  const [modalVisible, setModalVisible] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [userName, setUserName] = useState('');

  // Redux states
  const { user } = useSelector(state => state.auth);
  const {
    isBluetoothReady,
    isScanning,
    devices,
    scanStatus,
    error,
    connectedDevice
  } = useSelector(state => state.connection);

  // Bluetooth initialization
  useEffect(() => {
    const initBluetooth = async () => {
      if (Platform.OS === 'android') {
        await requestBluetoothPermission();
      }
      dispatch(initializeBluetooth());
    };

    initBluetooth();

    // BLE Manager event listeners
    const discoveryListener = bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      (device) => {
        dispatch(addDiscoveredDevice(device));
      }
    );

    return () => {
      discoveryListener.remove();
    };
  }, [dispatch]);

  // User name effect
  useEffect(() => {
    if (user) {
      const name = user.email.split('@')[0];
      setUserName(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }, [user]);

  // Auth state effect
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigation.reset({
          index: 0,
          routes: [{ name: 'login/login' }],
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Navigation options effect
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={styles.headerLogoutContainer}>
          <Text style={styles.headerLogoutText}>
            Logout {userName}
          </Text>
          <TouchableOpacity 
            onPress={() => handleSignOut(navigation)}
            style={styles.logoutButton}
          >
            <Feather name="log-out" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      ),
      headerLeft: () => null,
      gestureEnabled: false
    });

    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      if (e.data.action.type === 'GO_BACK') {
        e.preventDefault();
      }
    });

    return unsubscribe;
  }, [navigation, userName]);

  const requestBluetoothPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const locationPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );

        if (Platform.Version >= 31) {
          const bluetoothScan = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN
          );

          const bluetoothConnect = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
          );

          if (
            locationPermission === 'granted' &&
            bluetoothScan === 'granted' &&
            bluetoothConnect === 'granted'
          ) {
            return true;
          }
        } else {
          if (locationPermission === 'granted') {
            return true;
          }
        }
        return false;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  const scanAndConnect = async () => {
    if (!isBluetoothReady) {
      dispatch(setScanStatus('Bluetooth not ready'));
      return;
    }

    try {
      dispatch(clearDevices());
      dispatch(scanDevices());
    } catch (error) {
      console.error('Scan error:', error);
      dispatch(setScanStatus('Scan error: ' + error.message));
    }
  };

  const handleConnectToDevice = async (device) => {
    try {
      dispatch(setScanStatus(`Connecting to ${device.name || device.id}...`));
      
      const result = await dispatch(connectToDevice(device)).unwrap();
      setDeviceInfo(result);

      if (!user?.uid) {
        throw new Error('User ID is not available');
      }

      const vehicleData = {
        userId: user.uid,
        attributes: result.attributes,
        deviceId: device.id,
        name: device.name || `Device (${device.id})`
      };

      try {
        await dispatch(addVehicle(vehicleData)).unwrap();
        Alert.alert('Success', 'Device information has been saved to your vehicles.');
      } catch (error) {
        console.error('Error saving vehicle:', error);
        Alert.alert('Save Error', `Could not save device information: ${error.message || 'Unknown error'}`);
      }

      setModalVisible(true);
    } catch (error) {
      console.error('Connection error:', error);
      setDeviceInfo({
        name: device.name || device.id,
        error: 'Connection failed: ' + error.message
      });
      setModalVisible(true);
    }
  };

  const renderScreen = () => {
    switch(currentScreen) {
      case 'vehicle':
        return <VehicleDataScreen />;
      case 'profile':
        return <ProfileScreen />;
      default:
        return (
          <View style={styles.container}>
            <View style={styles.header}>
              <Text style={styles.welcomeText}>Welcome, {userName}!</Text>
              <Text style={styles.title}>Connect Your Device</Text>
            </View>
            
            <View style={styles.mainContent}>
              <TouchableOpacity 
                style={[styles.findDevicesButton, (!isBluetoothReady || isScanning) && styles.disabledButton]} 
                onPress={scanAndConnect}
                disabled={!isBluetoothReady || isScanning}
              >
                <Feather name="search" size={24} color="#FFFFFF" />
                <Text style={styles.findDevicesText}>
                  {isScanning ? 'Scanning...' : 'Find Devices'}
                </Text>
              </TouchableOpacity>

              <View style={styles.statusContainer}>
                {!isBluetoothReady && <Text style={styles.scanningText}>Bluetooth initializing...</Text>}
              </View>
              
              {devices.length > 0 && (
                <View style={styles.deviceList}>
                  <Text style={styles.deviceListTitle}>
                    Found Devices ({devices.filter(device => device.id && device.rssi && device.name).length}):
                  </Text>
                  <ScrollView style={styles.scrollView}>
                    {devices
                      .filter(device => device.id && device.rssi && device.name)
                      .map((device, index) => (
                        <TouchableOpacity 
                          key={index} 
                          style={styles.deviceButton}
                          onPress={() => handleConnectToDevice(device)}
                        >
                          <Text style={styles.deviceButtonText}>
                            {device.name}
                          </Text>
                          <Text style={styles.deviceId}>
                            RSSI: {device.rssi || 'N/A'}
                          </Text>
                        </TouchableOpacity>
                      ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>
        );
    }
  };

  return (
    <View style={styles.mainContainer}>
      {renderScreen()}

      <View style={styles.bottomContainer}>
        <View style={styles.navButtons}>
          <TouchableOpacity 
            style={[styles.navButton, currentScreen === 'bluetooth' && styles.activeNavButton]}
            onPress={() => setCurrentScreen('bluetooth')}
          >
            <Feather name="bluetooth" size={20} color={currentScreen === 'bluetooth' ? '#007AFF' : '#666'} />
            <Text style={[styles.navButtonText, currentScreen === 'bluetooth' && styles.activeNavText]}>
              Connect
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.navButton, currentScreen === 'vehicle' && styles.activeNavButton]}
            onPress={() => setCurrentScreen('vehicle')}
          >
            <Feather name="database" size={20} color={currentScreen === 'vehicle' ? '#007AFF' : '#666'} />
            <Text style={[styles.navButtonText, currentScreen === 'vehicle' && styles.activeNavText]}>
              Vehicle
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.navButton, currentScreen === 'profile' && styles.activeNavButton]}
            onPress={() => setCurrentScreen('profile')}
          >
            <Feather name="user" size={20} color={currentScreen === 'profile' ? '#007AFF' : '#666'} />
            <Text style={[styles.navButtonText, currentScreen === 'profile' && styles.activeNavText]}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {deviceInfo?.name || 'Device Info'}
            </Text>
            
            {deviceInfo?.error ? (
              <Text style={styles.errorText}>{deviceInfo.error}</Text>
            ) : (
              <View style={styles.deviceInfoContainer}>
                <Text style={styles.infoText}>Status: {deviceInfo?.status}</Text>
                <Text style={styles.infoText}>Signal Strength: {deviceInfo?.signalStrength}</Text>
                <Text style={styles.infoText}>Device ID: {deviceInfo?.deviceId}</Text>
              </View>
            )}
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => {
                setModalVisible(false);
                setDeviceInfo(null);
              }}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#F8F9FA',
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 24,
    color: '#333333',
    fontWeight: '500',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333333',
  },
  findDevicesButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  findDevicesText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  scanningText: {
    fontSize: 18,
    color: '#007AFF',
    marginBottom: 8,
  },
  deviceList: {
    width: '100%',
    height: '60%',
    marginTop: 20,
  },
  scrollView: {
    flex: 1,
    width: '100%',
  },
  deviceListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333333',
  },
  deviceButton: {
    backgroundColor: '#F0F8FF',
    padding: 15,
    borderRadius: 10,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  deviceButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  headerLogoutContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 15,
  },
  headerLogoutText: {
    color: '#007AFF',
    marginRight: 8,
    fontSize: 16,
  },
  disabledButton: {
    opacity: 0.6,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  bottomContainer: {
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderTopWidth: 1,
    borderTopColor: '#E8E8E8',
  },
  navButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    justifyContent: 'center',
  },
  activeNavButton: {
    backgroundColor: '#E8F2FF',
    borderColor: '#007AFF',
  },
  navButtonText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  activeNavText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    width: '80%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  deviceInfoContainer: {
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    marginBottom: 15,
  },
  infoText: {
    fontSize: 18,
    color: '#333',
    marginBottom: 8,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    marginBottom: 15,
  },
  closeButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default function ProtectedConnection() {
  return (
    <ProtectedRoute>
      <Connection />
    </ProtectedRoute>
  );
}
