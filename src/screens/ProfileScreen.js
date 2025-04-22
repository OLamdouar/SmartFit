import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useState, useContext, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { AuthContext } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { userData } = useContext(AuthContext);

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [goal, setGoal] = useState('');

  useEffect(() => {
    if (userData) {
      setFullName(userData.fullName || '');
      setAge(userData.age || '');
      setHeight(userData.height || '');
      setWeight(userData.weight || '');
      setGoal(userData.goal || '');
    }
  }, [userData]);

  const handleUpdate = async () => {
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        fullName,
        age,
        height,
        weight,
        goal
      });
      alert('Profile updated!');
      navigation.goBack();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Update Profile</Text>

      <TextInput
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
        style={styles.input}
      />
      <TextInput
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Height (cm)"
        value={height}
        onChangeText={setHeight}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Weight (kg)"
        value={weight}
        onChangeText={setWeight}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Goal (e.g., lose weight)"
        value={goal}
        onChangeText={setGoal}
        style={styles.input}
      />

      <Button title="Save Changes" onPress={handleUpdate} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex:1, padding:20, justifyContent:'center' },
  title: { fontSize:24, fontWeight:'bold', marginBottom:20, textAlign:'center' },
  input: { borderWidth:1, padding:10, marginVertical:10, borderRadius:5 },
});
