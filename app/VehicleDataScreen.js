import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, Alert, TextInput, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useDispatch, useSelector } from 'react-redux';
import { fetchVehicles, addVehicle, updateVehicle, deleteVehicle } from './store/vehicleSlice';
import { ProtectedRoute } from './ProtectedRoute';

function VehicleDataScreen() {
  const dispatch = useDispatch();
  const { vehicles, loading, error } = useSelector(state => state.vehicles);
  const [modalVisible, setModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState(null);
  const [newVehicle, setNewVehicle] = useState({
    colour: '',
    licence_plate: '',
    attributes: []
  });

  useEffect(() => {
    dispatch(fetchVehicles());
  }, [dispatch]);

  const handleAddVehicle = async () => {
    try {
      await dispatch(addVehicle(newVehicle)).unwrap();
      setModalVisible(false);
      setNewVehicle({ colour: '', licence_plate: '', attributes: [] });
      Alert.alert('Success', 'Vehicle added successfully');
    } catch (error) {
      console.error('Add Vehicle Error:', error); // Detaylı hata bilgisi
      Alert.alert('Error', `Failed to add vehicle: ${error}`);
    }
  };

  const handleUpdateVehicle = async () => {
    try {
      const currentAttributes = [...(editingVehicle.attributes || [])];
      
      // Device ID ve Name attributelerini bul
      const deviceIdAttr = currentAttributes.find(attr => attr.key === 'Device ID');
      const deviceNameAttr = currentAttributes.find(attr => attr.key === 'Device Name');
      
      // Diğer attributeleri filtrele
      const otherAttributes = currentAttributes.filter(attr => 
        attr.key !== 'Device ID' && attr.key !== 'Device Name'
      );

      // Güncellenmiş veriyi hazırla
      const updateData = {
        ...editingVehicle,
        // Sadece attribute'da varsa deviceId ve name'i ekle
        ...(deviceIdAttr ? { deviceId: deviceIdAttr.value } : { deviceId: null }),
        ...(deviceNameAttr ? { name: deviceNameAttr.value } : { name: null }),
        attributes: otherAttributes
      };

      // id'yi updateData'dan çıkar
      const { id, ...dataToUpdate } = updateData;

      await dispatch(updateVehicle({
        id: editingVehicle.id,
        data: dataToUpdate
      })).unwrap();
      
      setEditModalVisible(false);
      setEditingVehicle(null);
      Alert.alert('Success', 'Vehicle updated successfully');
      
      // Güncel listeyi getir
      dispatch(fetchVehicles());
    } catch (error) {
      console.error('Update Error:', error);
      Alert.alert('Error', error.toString());
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
              await dispatch(deleteVehicle(id)).unwrap();
              Alert.alert('Success', 'Vehicle deleted successfully');
            } catch (error) {
              Alert.alert('Error', error);
            }
          }
        }
      ]
    );
  };

  const addNewAttribute = (isEdit = false) => {
    if (isEdit) {
      setEditingVehicle({
        ...editingVehicle,
        attributes: [...(editingVehicle.attributes || []), { key: '', value: '' }]
      });
    } else {
      setNewVehicle({
        ...newVehicle,
        attributes: [...newVehicle.attributes, { key: '', value: '' }]
      });
    }
  };

  const updateAttribute = (index, field, value, isEdit = false) => {
    if (isEdit) {
      const updatedAttributes = [...(editingVehicle.attributes || [])];
      updatedAttributes[index] = {
        ...updatedAttributes[index],
        [field]: value
      };
      setEditingVehicle({
        ...editingVehicle,
        attributes: updatedAttributes
      });
    } else {
      const updatedAttributes = [...newVehicle.attributes];
      updatedAttributes[index] = {
        ...updatedAttributes[index],
        [field]: value
      };
      setNewVehicle({
        ...newVehicle,
        attributes: updatedAttributes
      });
    }
  };

  const removeAttribute = (index, isEdit = false) => {
    if (isEdit) {
      const attributeToRemove = editingVehicle.attributes[index];
      
      // Device ID veya Device Name siliniyorsa, ana objeden de sil
      if (attributeToRemove.key === 'Device ID' || attributeToRemove.key === 'Device Name') {
        const updatedVehicle = { ...editingVehicle };
        if (attributeToRemove.key === 'Device ID') {
          delete updatedVehicle.deviceId;
        }
        if (attributeToRemove.key === 'Device Name') {
          delete updatedVehicle.name;
        }
        // Attributes'dan da kaldır
        updatedVehicle.attributes = editingVehicle.attributes.filter((_, i) => i !== index);
        setEditingVehicle(updatedVehicle);
      } else {
        // Normal attribute silme işlemi
        const updatedAttributes = editingVehicle.attributes.filter((_, i) => i !== index);
        setEditingVehicle({
          ...editingVehicle,
          attributes: updatedAttributes
        });
      }
    } else {
      // Yeni araç ekleme modunda silme işlemi
      const updatedAttributes = newVehicle.attributes.filter((_, i) => i !== index);
      setNewVehicle({
        ...newVehicle,
        attributes: updatedAttributes
      });
    }
  };

  const renderAttributeInputs = (attributes, isEdit = false) => {
    return (
      <View style={styles.attributesContainer}>
        <View style={styles.attributesHeader}>
          <Text style={styles.attributesTitle}>Custom Attributes</Text>
          <TouchableOpacity 
            style={styles.addAttributeButton}
            onPress={() => addNewAttribute(isEdit)}
          >
            <Feather name="plus" size={20} color="#007AFF" />
            <Text style={styles.addAttributeText}>Add Attribute</Text>
          </TouchableOpacity>
        </View>

        {attributes.map((attr, index) => (
          <View key={index} style={styles.attributeRow}>
            <TextInput
              style={[styles.input, styles.attributeInput]}
              placeholder="Attribute Name"
              value={attr.key}
              onChangeText={(text) => updateAttribute(index, 'key', text, isEdit)}
            />
            <TextInput
              style={[styles.input, styles.attributeInput]}
              placeholder="Value"
              value={attr.value}
              onChangeText={(text) => updateAttribute(index, 'value', text, isEdit)}
            />
            <TouchableOpacity 
              onPress={() => removeAttribute(index, isEdit)}
              style={styles.removeAttributeButton}
            >
              <Feather name="x" size={20} color="#FF3B30" />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    );
  };

  const openEditModal = (vehicle) => {
    // Mevcut attributeleri kopyala
    const currentAttributes = [...(vehicle.attributes || [])];
    
    // Device ID ve Name'i attributes içinde var mı kontrol et
    const hasDeviceId = currentAttributes.some(attr => attr.key === 'Device ID');
    const hasDeviceName = currentAttributes.some(attr => attr.key === 'Device Name');

    // Sadece eksik olanları ekle
    if (vehicle.deviceId && !hasDeviceId) {
      currentAttributes.push({ key: 'Device ID', value: vehicle.deviceId });
    }
    if (vehicle.name && !hasDeviceName) {
      currentAttributes.push({ key: 'Device Name', value: vehicle.name });
    }

    setEditingVehicle({
      ...vehicle,
      attributes: currentAttributes
    });
    setEditModalVisible(true);
  };

  const EmptyListMessage = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No vehicles added yet</Text>
    </View>
  );

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
        data={vehicles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.dataCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.dataTitle}>Vehicle Information</Text>
              <View style={styles.actionButtons}>
                <TouchableOpacity 
                  onPress={() => openEditModal(item)}
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

            {/* Device ID ve Name'i göster */}
            {item.deviceId && (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Device ID:</Text>
                <Text style={styles.dataValue}>{item.deviceId}</Text>
              </View>
            )}
            {item.name && (
              <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Device Name:</Text>
                <Text style={styles.dataValue}>{item.name}</Text>
              </View>
            )}

            {/* Diğer attributeleri göster */}
            {Array.isArray(item.attributes) && item.attributes.map((attr, index) => (
              attr && attr.key && attr.key !== 'Device ID' && attr.key !== 'Device Name' && (
                <View key={index} style={styles.dataRow}>
                  <Text style={styles.dataLabel}>{attr.key}:</Text>
                  <Text style={styles.dataValue}>{attr.value || "Not Specified"}</Text>
                </View>
              )
            ))}
          </View>
        )}
        ListEmptyComponent={EmptyListMessage}
        contentContainerStyle={vehicles.length === 0 ? styles.emptyList : null}
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
          
            {renderAttributeInputs(newVehicle.attributes)}
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setNewVehicle({ colour: '', licence_plate: '', attributes: [] });
                }}
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
            
            {renderAttributeInputs(editingVehicle?.attributes || [], true)}
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
  attributesContainer: {
    marginTop: 10,
  },
  attributesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  attributesTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  addAttributeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  addAttributeText: {
    color: '#007AFF',
    marginLeft: 5,
    fontSize: 14,
  },
  attributeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  attributeInput: {
    flex: 1,
    marginRight: 10,
    marginBottom: 0,
  },
  removeAttributeButton: {
    padding: 5,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic'
  },
  emptyList: {
    flex: 1,
    justifyContent: 'center'
  }
});

export default function ProtectedVehicleDataScreen() {
  return (
    <ProtectedRoute>
      <VehicleDataScreen />
    </ProtectedRoute>
  );
}