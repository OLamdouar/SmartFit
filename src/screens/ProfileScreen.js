import React, { useState, useContext } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';

export default function ProfileScreen() {
  const { user, userData, setUserData } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);

  // Local state for editable fields
  const [formData, setFormData] = useState({
    fullName: userData.fullName,
    height: userData.height,
    weight: userData.weight,
    targetWeight: userData.targetWeight,
    goalType: userData.goalType,
    birthDate: userData.birthDate ? new Date(userData.birthDate).toISOString().split('T')[0] : '',
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...formData,
        height: Number(formData.height),
        weight: Number(formData.weight),
        targetWeight: Number(formData.targetWeight),
      });
      setUserData(prev => ({ ...prev, ...formData }));
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Your Profile</Text>

      {/* View or Edit Mode */}
      <View style={styles.field}>
        <Text style={styles.label}>Full Name:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={formData.fullName}
            onChangeText={text => handleInputChange('fullName', text)}
          />
        ) : (
          <Text style={styles.value}>{userData.fullName}</Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Email:</Text>
        <Text style={styles.value}>{userData.email}</Text>
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Height (cm):</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={formData.height.toString()}
            onChangeText={text => handleInputChange('height', text)}
            keyboardType="numeric"
          />
        ) : (
          <Text style={styles.value}>{userData.height}</Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Weight (kg):</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={formData.weight.toString()}
            onChangeText={text => handleInputChange('weight', text)}
            keyboardType="numeric"
          />
        ) : (
          <Text style={styles.value}>{userData.weight}</Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Target Weight (kg):</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={formData.targetWeight.toString()}
            onChangeText={text => handleInputChange('targetWeight', text)}
            keyboardType="numeric"
          />
        ) : (
          <Text style={styles.value}>{userData.targetWeight}</Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Goal Type:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={formData.goalType}
            onChangeText={text => handleInputChange('goalType', text)}
          />
        ) : (
          <Text style={styles.value}>{userData.goalType}</Text>
        )}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>Birth Date:</Text>
        {isEditing ? (
          <TextInput
            style={styles.input}
            value={formData.birthDate}
            onChangeText={text => handleInputChange('birthDate', text)}
            placeholder="YYYY-MM-DD"
          />
        ) : (
          <Text style={styles.value}>
            {userData.birthDate
              ? new Date(userData.birthDate).toLocaleDateString()
              : 'Not set'}
          </Text>
        )}
      </View>

      {/* Toggle Edit/Save */}
      {isEditing ? (
        <Button title="Save Changes" onPress={handleSave} color="#D4AF37" />
      ) : (
        <Button title="Edit Profile" onPress={() => setIsEditing(true)} color="#D4AF37" />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#141414',
    padding: 16,
    alignItems: 'center',
  },
  header: {
    fontSize: 24,
    color: '#D4AF37',
    marginBottom: 16,
    fontWeight: 'bold',
  },
  field: {
    width: '100%',
    marginBottom: 12,
  },
  label: {
    color: '#ccc',
    fontWeight: 'bold',
  },
  value: {
    color: '#fff',
    fontSize: 16,
    marginTop: 4,
  },
  input: {
    backgroundColor: '#1c1c1c',
    color: '#fff',
    borderColor: '#D4AF37',
    borderWidth: 1,
    borderRadius: 6,
    padding: Platform.OS === 'ios' ? 12 : 8,
    marginTop: 4,
  },
});
