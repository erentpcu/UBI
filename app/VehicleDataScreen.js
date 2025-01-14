import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from './secrets/auth';
import { Feather } from '@expo/vector-icons';

function VehicleDataScreen() {
  const [vehicleData, setVehicleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [newVehicle, setNewVehicle] = useState({
    colour: '',
    licence_plate: ''
  });

  useEffect(() => {
    fetchVehicleData();
  }, []);

  const fetchVehicleData = async () => {
    try {
      const carsCollection = collection(db, 'cars');
      const querySnapshot = await getDocs(carsCollection);
      const data = [];
      
      querySnapshot.forEach((doc) => {
        data.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      setVehicleData(data);
    } catch (error) {
      Alert.alert('Error', 'Error fetching vehicle data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async () => {
    try {
      setLoading(true);
      const carsCollection = collection(db, 'cars');
      await addDoc(carsCollection, newVehicle);
      setModalVisible(false);
      setNewVehicle({ colour: '', licence_plate: '' });
      await fetchVehicleData();
      Alert.alert('Success', 'Vehicle added successfully');
    } catch (error) {
      Alert.alert('Error', 'Error adding vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateVehicle = async () => {
    try {
      setLoading(true);
      const vehicleRef = doc(db, 'cars', editingVehicle.id);
      await updateDoc(vehicleRef, {
        colour: editingVehicle.colour,
        licence_plate: editingVehicle.licence_plate
      });
      setEditModalVisible(false);
      setEditingVehicle(null);
      await fetchVehicleData();
      Alert.alert('Success', 'Vehicle updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Error updating vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVehicle = async (id) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this vehicle?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const vehicleRef = doc(db, 'cars', id);
              await deleteDoc(vehicleRef);
              await fetchVehicleData();
              Alert.alert('Success', 'Vehicle deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Error deleting vehicle');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Feather name="plus" size={24} color="#fff" />
        <Text style={styles.addButtonText}>Add Vehicle</Text>
      </TouchableOpacity>

      <FlatList
        data={vehicleData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.dataCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.dataTitle}>Vehicle Information</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  onPress={() => {
                    setEditingVehicle(item);
                    setEditModalVisible(true);
                  }}
                  style={styles.editButton}
                >
                  <Feather name="edit" size={20} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity 
                  onPress={() => handleDeleteVehicle(item.id)}
                  style={styles.deleteButton}
                >
                  <Feather name="trash-2" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>Color:</Text>
              <Text style={styles.dataValue}>
                {item.colour?.trim() || "Not entered"}
              </Text>
            </View>
            <View style={styles.dataRow}>
              <Text style={styles.dataLabel}>License Plate:</Text>
              <Text style={styles.dataValue}>
                {item.licence_plate?.trim() || "Not entered"}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Add Vehicle Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add New Vehicle</Text>
            <TextInput
              style={styles.input}
              placeholder="Color"
              value={newVehicle.colour}
              onChangeText={(text) => setNewVehicle({...newVehicle, colour: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="License Plate"
              value={newVehicle.licence_plate}
              onChangeText={(text) => setNewVehicle({...newVehicle, licence_plate: text})}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddVehicle}
              >
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Vehicle Modal */}
      <Modal
        visible={editModalVisible}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Vehicle</Text>
            <TextInput
              style={styles.input}
              placeholder="Color"
              value={editingVehicle?.colour}
              onChangeText={(text) => setEditingVehicle({...editingVehicle, colour: text})}
            />
            <TextInput
              style={styles.input}
              placeholder="License Plate"
              value={editingVehicle?.licence_plate}
              onChangeText={(text) => setEditingVehicle({...editingVehicle, licence_plate: text})}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleUpdateVehicle}
              >
                <Text style={styles.buttonText}>Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dataCard: {
    backgroundColor: '#f8f9fa',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  dataTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007AFF',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  dataLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  dataValue: {
    fontSize: 14,
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#007AFF',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default VehicleDataScreen;