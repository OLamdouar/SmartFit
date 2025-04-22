

import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ImageBackground, Platform 
} from 'react-native';
import Slider from '@react-native-community/slider';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

export default function RegisterScreen({ navigation }) {
  // text fields
  const [fullName, setFullName] = useState('');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  
  // date of birth picker
  const [dob, setDob]                 = useState(null);
  const [showDobPicker, setShowDobPicker] = useState(false);

  // sliders
  const [height,      setHeight]      = useState(170);
  const [weight,      setWeight]      = useState(70);
  const [targetWeight,setTargetWeight]= useState(70);

  // goal type
  const [goalType, setGoalType] = useState(''); // 'Gain Muscle' / 'Weight Loss'

  // calculate age from dob
  const getAge = (date) => {
    const diff = Date.now() - date.getTime();
    const ageDt = new Date(diff);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  };

  // format date as DD/MM/YYYY
  const formatDate = (date) => {
    const d = date.getDate().toString().padStart(2,'0');
    const m = (date.getMonth()+1).toString().padStart(2,'0');
    const y = date.getFullYear();
    return `${d}/${m}/${y}`;
  };

  const handleRegister = async () => {
    if (!fullName || !email || !password || !dob || !goalType) {
      alert('Please fill in all required fields');
      return;
    }

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
      alert(error.message);
    }
  };

  return (
    <ImageBackground
      source={{ uri: '' }}
      style={styles.container}
      resizeMode="cover"
    >
      <View style={styles.form}>
        <Text style={styles.title}>Register</Text>

        <TextInput
          style={styles.input}
          placeholder="Full Name"
          placeholderTextColor="#ccc"
          value={fullName}
          onChangeText={setFullName}
        />

        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="#ccc"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#ccc"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Birth Date Picker */}
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDobPicker(true)}
        >
          <Text style={{ color: dob ? '#fff' : '#888' }}>
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
            backgroundColor: '#141414',
            height: 260,
            borderRadius: 10,
         }}
         textColor="#fff"
        />

        {/* Height Slider */}
        <View style={styles.sliderWrap}>
          <Text style={styles.sliderLabel}>Height: {height} cm</Text>
          <Slider
            style={styles.slider}
            minimumValue={100}
            maximumValue={220}
            step={1}
            value={height}
            onValueChange={setHeight}
            minimumTrackTintColor="#D4AF37"
            maximumTrackTintColor="#aaa"
            thumbTintColor="#D4AF37"
          />
        </View>

        {/* Current Weight Slider */}
        <View style={styles.sliderWrap}>
          <Text style={styles.sliderLabel}>Current Weight: {weight} kg</Text>
          <Slider
            style={styles.slider}
            minimumValue={30}
            maximumValue={200}
            step={1}
            value={weight}
            onValueChange={setWeight}
            minimumTrackTintColor="#D4AF37"
            maximumTrackTintColor="#aaa"
            thumbTintColor="#D4AF37"
          />
        </View>

        {/* Target Weight Slider */}
        <View style={styles.sliderWrap}>
          <Text style={styles.sliderLabel}>Target Weight: {targetWeight} kg</Text>
          <Slider
            style={styles.slider}
            minimumValue={30}
            maximumValue={200}
            step={1}
            value={targetWeight}
            onValueChange={setTargetWeight}
            minimumTrackTintColor="#D4AF37"
            maximumTrackTintColor="#aaa"
            thumbTintColor="#D4AF37"
          />
        </View>

        {/* Goal Type Buttons */}
        <View style={styles.goalWrap}>
          {['Gain Muscle','Weight Loss'].map((opt) => (
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

        <TouchableOpacity style={styles.submit} onPress={handleRegister}>
          <Text style={styles.submitText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
          <Text style={styles.link}>Already have an account? Log In</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#141414', justifyContent: 'center', alignItems: 'center' },
  form: {
    width: '90%',
    backgroundColor: 'rgba(20,20,20,0.85)',
    padding: 20,
    borderRadius: 10,
    borderWidth:1,
    borderColor:'#D4AF37'
  },
  title:{ fontSize:28, fontWeight:'bold', color:'#D4AF37', textAlign:'center', marginBottom:20 },
  input:{ backgroundColor:'#1c1c1c', color:'#fff', borderColor:'#D4AF37', borderWidth:1, borderRadius:8, padding:12, marginVertical:8 },
  sliderWrap:{ marginVertical:8 },
  sliderLabel:{ color:'#fff', textAlign:'center', marginBottom:4 },
  slider:{ width:'100%', height: Platform.OS==='ios'?40:30 },
  goalWrap:{ flexDirection:'row', justifyContent:'space-around', marginVertical:12 },
  goalBtn:{ paddingVertical:8, paddingHorizontal:12, borderRadius:8, borderWidth:1, borderColor:'#D4AF37' },
  goalBtnSel:{ backgroundColor:'#D4AF37' },
  goalText:{ color:'#D4AF37' },
  goalTextSel:{ color:'#141414', fontWeight:'bold' },
  submit:{ backgroundColor:'#D4AF37', padding:15, borderRadius:8, marginVertical:12, alignItems:'center' },
  submitText:{ color:'#141414', fontSize:16, fontWeight:'bold' },
  link:{ color:'#D4AF37', textAlign:'center' }
});
