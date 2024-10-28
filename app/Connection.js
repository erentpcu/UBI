import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import BleManager from 'react-native-ble-manager';
import { NativeEventEmitter, NativeModules, PermissionsAndroid } from 'react-native';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

function Connection() {
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [isBluetoothReady, setIsBluetoothReady] = useState(false);

  const requestBluetoothPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);
        
        return Object.values(granted).every(
          permission => permission === PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  useEffect(() => {
    const initializeBluetooth = async () => {
      try {
        await requestBluetoothPermission();
        
        // BleManager'ı başlat
        await BleManager.start({ showAlert: false });
        console.log('BleManager initialized');
        setIsBluetoothReady(true);

        // Bluetooth durumunu kontrol et
        const state = await BleManager.checkState();
        if (state !== 'on') {
          if (Platform.OS === 'android') {
            await BleManager.enableBluetooth();
          }
        }
      } catch (error) {
        console.error('Initialization error:', error);
      }
    };

    initializeBluetooth();

    // Cihaz bulma event listener'ı
    const discoveryListener = bleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      (peripheral) => {
        console.log('Discovered peripheral:', peripheral);
        setDevices(prevDevices => {
          if (!prevDevices.some(device => device.id === peripheral.id)) {
            return [...prevDevices, peripheral];
          }
          return prevDevices;
        });
      }
    );

    // Cleanup
    return () => {
      discoveryListener.remove();
      BleManager.stopScan();
    };
  }, []);

  const scanAndConnect = async () => {
    if (!isBluetoothReady) {
      console.log('Bluetooth is not ready yet');
      return;
    }

    try {
      setDevices([]);
      setIsScanning(true);
      
      await BleManager.scan([], 5, true);
      console.log('Scanning started...');

      setTimeout(async () => {
        try {
          await BleManager.stopScan();
          console.log('Scanning stopped');
          setIsScanning(false);
        } catch (error) {
          console.error('Error stopping scan:', error);
        }
      }, 5000);
    } catch (error) {
      console.error('Error during scan:', error);
      setIsScanning(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Connect Your Device</Text>
        
        <TouchableOpacity 
          style={[styles.scanButton, (!isBluetoothReady || isScanning) && styles.disabledButton]} 
          onPress={scanAndConnect}
          disabled={!isBluetoothReady || isScanning}
        >
          <Image
            source={require('../app/bluetooth.gif')}
            style={styles.bluetoothIcon}
          />
        </TouchableOpacity>
        
        {isScanning && <Text style={styles.scanningText}>Scanning...</Text>}
        {!isBluetoothReady && <Text style={styles.scanningText}>Initializing Bluetooth...</Text>}
        
        {devices.length > 0 && (
          <View style={styles.deviceList}>
            <Text style={styles.deviceListTitle}>Available Devices:</Text>
            {devices.map((device, index) => (
              <TouchableOpacity key={index} style={styles.deviceButton}>
                <Text style={styles.deviceButtonText}>{device.name || 'Unnamed Device'}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  gifImage: {
    width: 200,
    height: 200,
    marginBottom: 50,
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333333',
    marginBottom: 75,
  },
  deviceIconContainer: {
    marginBottom: 30,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginBottom: 15,
    width: '100%',
  },
  iconCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  buttonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  disabledButton: {
    opacity: 0.5,
  },
  deviceList: {
    width: '100%',
    marginTop: 20,
  },
  deviceListTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  deviceButton: {
    backgroundColor: '#F0F8FF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 5,
  },
  deviceButtonText: {
    fontSize: 14,
    color: '#007AFF',
  },
  scanButton: {
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    borderRadius: 50,
    marginBottom: 20,
  },
  bluetoothIcon: {
    width: 120,
    height: 120,
  },
  scanningText: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 20,
  },
});

export default Connection;
