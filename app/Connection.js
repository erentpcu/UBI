import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import BleManager from 'react-native-ble-manager';
import { NativeEventEmitter, NativeModules, PermissionsAndroid } from 'react-native';
import { auth, handleSignOut } from './secrets/auth';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import VehicleDataScreen from './VehicleDataScreen';
import ProfileScreen from './ProfileScreen';

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

function Connection() {
  const navigation = useNavigation();
  const [currentScreen, setCurrentScreen] = useState('bluetooth'); // 'bluetooth', 'vehicle' veya 'profile'
  const [isScanning, setIsScanning] = useState(false);
  const [devices, setDevices] = useState([]);
  const [isBluetoothReady, setIsBluetoothReady] = useState(false);
  const [scanStatus, setScanStatus] = useState('');
  const { user } = useSelector(state => state.auth);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (user) {
      const name = user.email.split('@')[0];
      setUserName(name.charAt(0).toUpperCase() + name.slice(1));
    }
  }, [user]);

  // Auth kontrolü
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

  // Navigation kontrolü için useEffect
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
      // Geri tuşunu devre dışı bırak
      headerLeft: () => null,
      gestureEnabled: false
    });

    // Geri tuşunu tamamen devre dışı bırak
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
      // Eğer action type 'GO_BACK' ise engelle
      if (e.data.action.type === 'GO_BACK') {
        e.preventDefault();
      }
    });

    return unsubscribe;
  }, [navigation, userName]);

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
                style={[styles.scanButton, (!isBluetoothReady || isScanning) && styles.disabledButton]} 
                onPress={scanAndConnect}
                disabled={!isBluetoothReady || isScanning}
              >
                <Image
                  source={require('../app/bluetooth.gif')}
                  style={styles.bluetoothIcon}
                  resizeMode="contain"
                />
              </TouchableOpacity>
              
              <View style={styles.statusContainer}>
                {isScanning && <Text style={styles.scanningText}>Scanning...</Text>}
                {!isBluetoothReady && <Text style={styles.scanningText}>Bluetooth başlatılıyor...</Text>}
                <Text style={styles.statusText}>{scanStatus}</Text>
              </View>
              
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
                        {device.name || 'OBD2 Device'} ({device.id})
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>
        );
    }
  };

  return (
    <View style={styles.mainContainer}>
      {/* Main Content */}
      {renderScreen()}

      {/* Bottom Navigation */}
      <View style={styles.bottomContainer}>
        <View style={styles.navButtons}>
          <TouchableOpacity 
            style={[
              styles.navButton, 
              currentScreen === 'bluetooth' && styles.activeNavButton
            ]}
            onPress={() => setCurrentScreen('bluetooth')}
          >
            <Feather 
              name="bluetooth" 
              size={20} 
              color={currentScreen === 'bluetooth' ? '#007AFF' : '#666'} 
            />
            <Text style={[
              styles.navButtonText,
              currentScreen === 'bluetooth' && styles.activeNavText
            ]}>
              Connect
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.navButton, 
              currentScreen === 'vehicle' && styles.activeNavButton
            ]}
            onPress={() => setCurrentScreen('vehicle')}
          >
            <Feather 
              name="database" 
              size={20} 
              color={currentScreen === 'vehicle' ? '#007AFF' : '#666'} 
            />
            <Text style={[
              styles.navButtonText,
              currentScreen === 'vehicle' && styles.activeNavText
            ]}>
              Vehicle
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[
              styles.navButton, 
              currentScreen === 'profile' && styles.activeNavButton
            ]}
            onPress={() => setCurrentScreen('profile')}
          >
            <Feather 
              name="user" 
              size={20} 
              color={currentScreen === 'profile' ? '#007AFF' : '#666'} 
            />
            <Text style={[
              styles.navButtonText,
              currentScreen === 'profile' && styles.activeNavText
            ]}>
              Profile
            </Text>
          </TouchableOpacity>
        </View>
      </View>
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
  scanButton: {
    width: 160,
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F0F8FF',
    borderRadius: 80,
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
  bluetoothIcon: {
    width: 120,
    height: 120,
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
  statusText: {
    fontSize: 16,
    color: '#666666',
  },
  deviceList: {
    width: '100%',
    flex: 1,
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
  footer: {
    padding: 20,
    backgroundColor: '#F8F9FA',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    paddingVertical: 15,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default Connection;
