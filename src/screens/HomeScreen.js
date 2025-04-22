

import React, { useContext } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function HomeScreen({ navigation }) {
  const { userData } = useContext(AuthContext);
  const firstName = userData?.fullName ? userData.fullName.split(' ')[0] : 'User';

  return (
    <View style={styles.container}>
      <Text style={styles.welcome}>Welcome, {firstName}!</Text>

      {/* ← Add your Calorie Tracker button here */}
      <View style={styles.buttonContainer}>
        <Button
          title="Calorie Tracker"
          onPress={() => navigation.navigate('CalorieTracker')}
          color="#D4AF37"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#141414',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  welcome: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
  },
  buttonContainer: {
    width: '80%',
    marginTop: 12,
  },
});
