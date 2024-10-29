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
  const [scanStatus, setScanStatus] = useState(''); // Yeni state

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
        const permissionGranted = await requestBluetoothPermission();
        if (!permissionGranted) {
          setScanStatus('Bluetooth izinleri reddedildi');
          return;
        }
        
        await BleManager.start({ showAlert: false });
        setIsBluetoothReady(true);

        // Bluetooth durumunu kontrol et ve kapalıysa aç
        const state = await BleManager.checkState();
        if (state !== 'on') {
          setScanStatus('Bluetooth açılıyor...');
          if (Platform.OS === 'android') {
            try {
              await BleManager.enableBluetooth();
              setScanStatus('Bluetooth açıldı');
            } catch (error) {
              setScanStatus('Bluetooth açılamadı. Lütfen manuel olarak açın.');
              return;
            }
          } else {
            setScanStatus('Lütfen Bluetooth\'u açın');
            return;
          }
        }
      } catch (error) {
        console.error('Initialization error:', error);
        setScanStatus('Bluetooth başlatılamadı');
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
      setScanStatus('Bluetooth hazır değil');
      return;
    }

    try {
      setDevices([]);
      setIsScanning(true);
      setScanStatus('OBD2 cihazları aranıyor...');
      
      // OBD2 cihazları için tarama - genellikle OBD-II veya PLX gibi isimler içerir
      await BleManager.scan([], 10, true);

      setTimeout(async () => {
        try {
          await BleManager.stopScan();
          setIsScanning(false);
          if (devices.length === 0) {
            setScanStatus('OBD2 cihazı bulunamadı');
          } else {
            setScanStatus(`${devices.length} cihaz bulundu`);
          }
        } catch (error) {
          console.error('Error stopping scan:', error);
        }
      }, 10000); // 10 saniye tarama
    } catch (error) {
      console.error('Error during scan:', error);
      setIsScanning(false);
    }
  };

  // Cihaz bağlantı fonksiyonu
  const connectToDevice = async (device) => {
    try {
      setScanStatus(`${device.name || 'Cihaz'} bağlanıyor...`);
      await BleManager.connect(device.id);
      setScanStatus('Bağlantı başarılı!');
      // Burada OBD2 spesifik karakteristikleri keşfedebilirsiniz
    } catch (error) {
      console.error('Connection error:', error);
      setScanStatus('Bağlantı başarısız');
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
              <TouchableOpacity 
                key={index} 
                style={styles.deviceButton}
                onPress={() => connectToDevice(device)}
              >
                <Text style={styles.deviceButtonText}>
                  {device.name || 'OBD2 Cihazı'} ({device.id})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        {scanStatus ? (
          <Text style={styles.statusText}>{scanStatus}</Text>
        ) : null}
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
  statusText: {
    fontSize: 16,
    color: '#333333',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default Connection;
