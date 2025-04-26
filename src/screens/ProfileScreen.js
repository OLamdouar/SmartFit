import React, { useState, useContext, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  StyleSheet, 
  Alert, 
  Platform, 
  ScrollView, 
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { db } from '../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { Feather, Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function ProfileScreen() {
  const { user, userData, setUserData } = useContext(AuthContext);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardScaleAnim = useRef(new Animated.Value(0.95)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

  // Local state for editable fields
  const [formData, setFormData] = useState({
    fullName: userData?.fullName || '',
    height: userData?.height || '',
    weight: userData?.weight || '',
    targetWeight: userData?.targetWeight || '',
    goalType: userData?.goalType || '',
    birthDate: userData?.birthDate ? new Date(userData.birthDate).toISOString().split('T')[0] : '',
  });

  useEffect(() => {
    // Run entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(cardScaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.timing(buttonAnim, {
        toValue: 1,
        duration: 1000,
        delay: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        ...formData,
        height: Number(formData.height) || 0,
        weight: Number(formData.weight) || 0,
        targetWeight: Number(formData.targetWeight) || 0,
      });
      setUserData(prev => ({ ...prev, ...formData }));
      setIsEditing(false);
      Alert.alert('Success', 'Profile updated successfully!');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    setFormData({
      fullName: userData?.fullName || '',
      height: userData?.height || '',
      weight: userData?.weight || '',
      targetWeight: userData?.targetWeight || '',
      goalType: userData?.goalType || '',
      birthDate: userData?.birthDate ? new Date(userData.birthDate).toISOString().split('T')[0] : '',
    });
    setIsEditing(false);
  };

  const renderField = (label, value, fieldName, placeholder, keyboardType = 'default') => (
    <View style={[styles.field, fieldName === 'height' || fieldName === 'weight' ? styles.halfWidthField : null]}>
      <Text style={styles.label}>{label}</Text>
      {isEditing ? (
        <View style={styles.inputContainer}>
          <Ionicons 
            name={getIconForField(fieldName)} 
            size={20} 
            color="#D4AF37" 
            style={styles.inputIcon} 
          />
          <TextInput
            style={styles.input}
            value={String(value)}
            onChangeText={text => handleInputChange(fieldName, text)}
            keyboardType={keyboardType}
            placeholder={placeholder}
            placeholderTextColor="rgba(255,255,255,0.5)"
          />
        </View>
      ) : (
        <View style={styles.valueContainer}>
          <Ionicons 
            name={getIconForField(fieldName)} 
            size={20} 
            color="#D4AF37" 
            style={styles.valueIcon} 
          />
          <Text style={styles.value}>
            {value || 'Not set'}
          </Text>
        </View>
      )}
    </View>
  );

  const getIconForField = (fieldName) => {
    switch(fieldName) {
      case 'fullName': return 'person-outline';
      case 'height': return 'resize-outline';
      case 'weight': return 'fitness-outline';
      case 'targetWeight': return 'trending-down-outline';
      case 'goalType': return 'trophy-outline';
      case 'birthDate': return 'calendar-outline';
      default: return 'ellipse-outline';
    }
  };

  return (
    <LinearGradient
      colors={['#1A1A2E', '#16213E', '#0F3460']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.safeArea}>
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <Animated.View 
            style={[
              styles.headerSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.profileImageContainer}>
              <Text style={styles.profileInitial}>
                {userData?.fullName?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <Text style={styles.header}>Your Profile</Text>
            <Text style={styles.subheader}>Manage your personal information</Text>
          </Animated.View>

          {/* Card Container */}
          <Animated.View 
            style={[
              styles.cardWrapper,
              {
                opacity: fadeAnim,
                transform: [{ scale: cardScaleAnim }]
              }
            ]}
          >
            <LinearGradient
              colors={['rgba(212, 175, 55, 0.3)', 'rgba(212, 175, 55, 0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardContainer}
            >
              {/* Fields */}
              {renderField('Full Name', formData.fullName, 'fullName', 'Enter your full name')}
              
              <View style={styles.fieldRow}>
                {renderField('Height (cm)', formData.height, 'height', '0', 'numeric')}
                {renderField('Weight (kg)', formData.weight, 'weight', '0', 'numeric')}
              </View>

              {renderField('Target Weight (kg)', formData.targetWeight, 'targetWeight', '0', 'numeric')}
              {renderField('Goal Type', formData.goalType, 'goalType', 'e.g. Weight Loss, Muscle Gain')}
              {renderField('Birth Date', 
                formData.birthDate ? 
                  new Date(formData.birthDate).toLocaleDateString() : 
                  formData.birthDate, 
                'birthDate', 'YYYY-MM-DD')}
            </LinearGradient>
          </Animated.View>

          {/* Buttons */}
          <Animated.View style={[styles.buttonContainer, { opacity: buttonAnim }]}>
            {isEditing ? (
              <>
                <TouchableOpacity 
                  style={[styles.button, styles.cancelButton]} 
                  onPress={handleCancel}
                  activeOpacity={0.8}
                >
                  <Feather name="x" size={20} color="#FFF" />
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.button, styles.saveButton]} 
                  onPress={handleSave}
                  disabled={isSaving}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#D4AF37', '#F5CC59']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                  >
                    <Feather name="check" size={20} color="#16213E" />
                    <Text style={styles.saveButtonText}>
                      {isSaving ? 'Saving...' : 'Save Changes'}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                style={[styles.button, styles.editButton]} 
                onPress={() => setIsEditing(true)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#D4AF37', '#F5CC59']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                  <Feather name="edit-2" size={20} color="#16213E" />
                  <Text style={styles.editButtonText}>Edit Profile</Text>
                </LinearGradient>
              </TouchableOpacity>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  headerSection: {
    width: '100%',
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  profileImageContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 2,
    borderColor: 'rgba(212, 175, 55, 0.5)',
  },
  profileInitial: {
    fontSize: 44,
    fontWeight: 'bold',
    color: '#16213E',
  },
  header: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#D4AF37',
    textAlign: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  subheader: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 16,
    marginTop: 8,
  },
  cardWrapper: {
    width: '100%',
    maxWidth: 500,
    alignSelf: 'center',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  cardContainer: {
    padding: 24,
    borderRadius: 16,
  },
  field: {
    width: '100%',
    marginBottom: 16,
  },
  halfWidthField: {
    width: '47%', // Adjusted to ensure proper spacing
  },
  fieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  label: {
    color: '#D4AF37',
    fontWeight: 'bold',
    fontSize: 15,
    marginBottom: 8,
  },
  valueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderWidth: 1,
  },
  valueIcon: {
    marginRight: 14,
  },
  value: {
    color: '#FFFFFF',
    fontSize: 16,
    flex: 1,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(212, 175, 55, 0.5)',
    borderWidth: 1,
    borderRadius: 12,
    height: 56,
  },
  inputIcon: {
    marginHorizontal: 16,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    height: '100%',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    width: '100%',
    marginTop: 24,
    gap: 12,
  },
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    flex: 1,
    maxWidth: 200,
  },
  editButtonText: {
    color: '#16213E',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  saveButton: {
    flex: 2,
  },
  saveButtonText: {
    color: '#16213E',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 8,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  cancelButtonText: {
    color: '#FFF',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: 8,
  },
});