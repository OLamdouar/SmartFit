import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  ScrollView,
  Platform,
  StatusBar,
  Alert,
  Animated,
  KeyboardAvoidingView
} from 'react-native';
import Slider from '@react-native-community/slider';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

export default function RegisterScreen({ navigation }) {
  // text fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // date of birth picker
  const [dob, setDob] = useState(null);
  const [showDobPicker, setShowDobPicker] = useState(false);

  // sliders
  const [height, setHeight] = useState(170);
  const [weight, setWeight] = useState(70);
  const [targetWeight, setTargetWeight] = useState(70);

  // goal type
  const [goalType, setGoalType] = useState(''); // 'Gain Muscle' / 'Weight Loss'
  
  // loading state
  const [loading, setLoading] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const formScaleAnim = useRef(new Animated.Value(0.95)).current;
  const buttonAnim = useRef(new Animated.Value(0)).current;

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
      Animated.spring(formScaleAnim, {
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

  // calculate age from dob
  const getAge = (date) => {
    const diff = Date.now() - date.getTime();
    const ageDt = new Date(diff);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  // format date as DD/MM/YYYY
  const formatDate = (date) => {
    const d = date.getDate().toString().padStart(2, '0');
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const handleRegister = async () => {
    if (!fullName || !email || !password || !dob || !goalType) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    const age = getAge(dob);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email,
        birthDate: dob.toISOString(),
        age,
        height,
        weight,
        targetWeight,
        goalType,
        createdAt: serverTimestamp(),
      });
      
    } catch (error) {
      Alert.alert('Registration Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#1A1A2E', '#16213E', '#0F3460']}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardContainer}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Form Container - Immediately start with this section */}
          <Animated.View 
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: formScaleAnim }
                ]
              }
            ]}
          >
            <LinearGradient
              colors={['rgba(212, 175, 55, 0.3)', 'rgba(212, 175, 55, 0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.formGradient}
            >
              <Text style={styles.formTitle}>Create Account</Text>
              <Text style={styles.formSubtitle}>Join our fitness community</Text>
              
              {/* Full Name Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#D4AF37" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>
              
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="mail-outline" size={20} color="#D4AF37" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
              
              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed-outline" size={20} color="#D4AF37" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                  <Ionicons 
                    name={showPassword ? "eye-outline" : "eye-off-outline"} 
                    size={20} 
                    color="#D4AF37"
                  />
                </TouchableOpacity>
              </View>
              
              {/* Birth Date Picker */}
              <TouchableOpacity
                style={styles.inputContainer}
                onPress={() => setShowDobPicker(true)}
              >
                <Ionicons name="calendar-outline" size={20} color="#D4AF37" style={styles.inputIcon} />
                <Text style={[styles.input, { color: dob ? '#fff' : 'rgba(255,255,255,0.5)' }]}>
                  {dob ? formatDate(dob) : 'Select Birth Date'}
                </Text>
              </TouchableOpacity>
              <DateTimePickerModal
                isVisible={showDobPicker}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                maximumDate={new Date()}
                onConfirm={(date) => {
                  setShowDobPicker(false);
                  setDob(date);
                }}
                onCancel={() => setShowDobPicker(false)}
                pickerContainerStyleIOS={{                             
                  backgroundColor: '#16213E',
                  height: 260,
                  borderRadius: 10,
                }}
                textColor="#fff"
              />

              {/* Height Slider */}
              <View style={styles.sliderWrap}>
                <Text style={styles.sliderLabel}>Height: {height} cm</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={100}
                  maximumValue={220}
                  step={1}
                  value={height}
                  onValueChange={setHeight}
                  minimumTrackTintColor="#D4AF37"
                  maximumTrackTintColor="rgba(255,255,255,0.2)"
                  thumbTintColor="#D4AF37"
                />
              </View>

              {/* Current Weight Slider */}
              <View style={styles.sliderWrap}>
                <Text style={styles.sliderLabel}>Current Weight: {weight} kg</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={30}
                  maximumValue={200}
                  step={1}
                  value={weight}
                  onValueChange={setWeight}
                  minimumTrackTintColor="#D4AF37"
                  maximumTrackTintColor="rgba(255,255,255,0.2)"
                  thumbTintColor="#D4AF37"
                />
              </View>

              {/* Target Weight Slider */}
              <View style={styles.sliderWrap}>
                <Text style={styles.sliderLabel}>Target Weight: {targetWeight} kg</Text>
                <Slider
                  style={styles.slider}
                  minimumValue={30}
                  maximumValue={200}
                  step={1}
                  value={targetWeight}
                  onValueChange={setTargetWeight}
                  minimumTrackTintColor="#D4AF37"
                  maximumTrackTintColor="rgba(255,255,255,0.2)"
                  thumbTintColor="#D4AF37"
                />
              </View>

              {/* Goal Type Buttons */}
              <View style={styles.goalWrap}>
                <Text style={styles.goalTitle}>Your Fitness Goal:</Text>
                <View style={styles.goalButtonsContainer}>
                  {['Gain Muscle', 'Weight Loss'].map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[
                        styles.goalBtn,
                        goalType === opt && styles.goalBtnSel
                      ]}
                      onPress={() => setGoalType(opt)}
                    >
                      <Text
                        style={[
                          styles.goalText,
                          goalType === opt && styles.goalTextSel
                        ]}
                      >
                        {opt}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <Animated.View style={{ opacity: buttonAnim }}>
                <TouchableOpacity
                  style={styles.registerButton}
                  onPress={handleRegister}
                  disabled={loading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#D4AF37', '#F5CC59']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.buttonText}>Create Account</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            </LinearGradient>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.loginContainer,
              { opacity: fadeAnim }
            ]}
          >
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 40,
    // Add extra padding at the top to prevent collision with status bar
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 20,
  },
  formGradient: {
    padding: 25,
    borderRadius: 16,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  formSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(212, 175, 55, 0.5)',
    borderWidth: 1,
    borderRadius: 12,
    marginVertical: 8,
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
  eyeIcon: {
    padding: 16,
  },
  sliderWrap: {
    marginVertical: 12,
  },
  sliderLabel: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
    fontSize: 15,
  },
  slider: { 
    width: '100%', 
    height: Platform.OS === 'ios' ? 40 : 30,
  },
  goalWrap: {
    marginVertical: 16,
  },
  goalTitle: {
    color: '#fff',
    textAlign: 'center',
    marginBottom: 12,
    fontSize: 15,
  },
  goalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 8,
  },
  goalBtn: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D4AF37',
    minWidth: 120,
    alignItems: 'center',
  },
  goalBtnSel: {
    backgroundColor: '#D4AF37',
  },
  goalText: {
    color: '#D4AF37',
    fontSize: 15,
  },
  goalTextSel: {
    color: '#16213E',
    fontWeight: 'bold',
  },
  registerButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginTop: 20,
    shadowColor: '#D4AF37',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#16213E',
    fontWeight: '700',
    fontSize: 16,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  loginText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 15,
  },
  loginLink: {
    color: '#D4AF37',
    fontWeight: 'bold',
    fontSize: 15,
  },
});