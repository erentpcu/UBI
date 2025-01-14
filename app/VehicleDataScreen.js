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
      Alert.alert('Error', error);
    }
  };

  const handleUpdateVehicle = async () => {
    try {
      await dispatch(updateVehicle({
        id: editingVehicle.id,
        data: {
          colour: editingVehicle.colour,
          licence_plate: editingVehicle.licence_plate,
          attributes: editingVehicle.attributes || []
        }
      })).unwrap();
      setEditModalVisible(false);
      setEditingVehicle(null);
      Alert.alert('Success', 'Vehicle updated successfully');
    } catch (error) {
      Alert.alert('Error', error);
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
      const updatedAttributes = editingVehicle.attributes.filter((_, i) => i !== index);
      setEditingVehicle({
        ...editingVehicle,
        attributes: updatedAttributes
      });
    } else {
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
    setEditingVehicle({
      ...vehicle,
      attributes: vehicle.attributes || []
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

  


          {item.colour?.trim() && 
          <View style={styles.dataRow}>
                <Text style={styles.dataLabel}>Color:</Text>
                <Text style={styles.dataValue}>
                {item.colour?.trim() || "Not entered"}
              </Text>
            </View> }
            
              

          {item.icence_plate?.trim()  && <View style={styles.dataRow}> <Text style={styles.dataLabel}>License Plate:</Text>
              <Text style={styles.dataValue}>
                {item.licence_plate?.trim() || "Not entered"}
              </Text>
            </View>}



            
    
            {item.attributes?.map((attr, index) => 
              {attr?.value && <View key={index} style={styles.dataRow}>
                <Text style={styles.dataLabel}>{attr.key}:</Text>
                <Text style={styles.dataValue}>{attr.value || "Not entered"}</Text>
              </View>}
            )}
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