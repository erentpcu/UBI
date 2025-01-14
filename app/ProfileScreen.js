import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { handleSignOut } from './secrets/auth';
import { useNavigation } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { ProtectedRoute } from './ProtectedRoute';

function ProfileScreen() {
  const navigation = useNavigation();
  const { user } = useSelector(state => state.auth);
  const userName = user ? user.email.split('@')[0] : '';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.email}>{user?.email}</Text>
      
      <TouchableOpacity 
        style={styles.logoutButton}
        onPress={() => handleSignOut(navigation)}
      >
        <Text style={styles.logoutButtonText}>Logout {userName}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default function ProtectedProfileScreen() {
  return (
    <ProtectedRoute>
      <ProfileScreen />
    </ProtectedRoute>
  );
}
