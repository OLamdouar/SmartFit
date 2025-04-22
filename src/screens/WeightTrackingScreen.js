

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';


const MS_IN_A_WEEK = 7 * 24 * 60 * 60 * 1000;

const calculateRegressionPrediction = (entries, targetWeight) => {
  // Require at least two entries for a regression
  if (entries.length < 2) {
    return null;
  }

  // Establish a baseline time from the first entry (assumes Firestore Timestamp)
  const baseline = entries[0].timestamp.toDate().getTime();
  const dataPoints = entries.map((entry) => {
    const x = (entry.timestamp.toDate().getTime() - baseline) / MS_IN_A_WEEK;
    const y = entry.weight;
    return { x, y };
  });

  const n = dataPoints.length;
  const sumX = dataPoints.reduce((acc, p) => acc + p.x, 0);
  const sumY = dataPoints.reduce((acc, p) => acc + p.y, 0);
  const meanX = sumX / n;
  const meanY = sumY / n;

  let numerator = 0;
  let denominator = 0;
  dataPoints.forEach(({ x, y }) => {
    numerator += (x - meanX) * (y - meanY);
    denominator += (x - meanX) ** 2;
  });

  if (denominator === 0) {
    return null;
  }

  const slope = numerator / denominator;
  const intercept = meanY - slope * meanX;

  // Check to avoid division by zero or non-trending data
  if (Math.abs(slope) < 0.0001) {
    return null;
  }

  const targetWeekOffset = (targetWeight - intercept) / slope;
  const lastEntry = dataPoints[dataPoints.length - 1];
  const currentWeekOffset = lastEntry.x;

  const weeksRemaining = targetWeekOffset - currentWeekOffset;
  return weeksRemaining > 0 ? Math.round(weeksRemaining) : 0;
};

const WeightTrackingScreen = () => {
  const [weight, setWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [entries, setEntries] = useState([]);
  const [prediction, setPrediction] = useState(null);

  // Reference to the current user's weightEntries subcollection
  const userId = auth.currentUser?.uid;
  const entriesRef = collection(db, 'users', userId, 'weightEntries');


  // Listen to Firestore changes in the weight entries subcollection
  useEffect(() => {
    const q = query(entriesRef, orderBy('timestamp', 'asc'));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedEntries = [];
      querySnapshot.forEach((doc) => {
        fetchedEntries.push({ id: doc.id, ...doc.data() });
      });
      setEntries(fetchedEntries);

      // Update prediction if a valid target weight is provided
      if (targetWeight) {
        const weeksLeft = calculateRegressionPrediction(fetchedEntries, parseFloat(targetWeight));
        setPrediction(weeksLeft);
      }
    });
    return () => unsubscribe();
  }, [targetWeight]);

  const addWeightEntry = async () => {
    const weightNumber = parseFloat(weight);
    if (isNaN(weightNumber)) {
      Alert.alert('Invalid Weight', 'Please enter a valid number for weight.');
      return;
    }

    try {
      await addDoc(entriesRef, {
        weight: weightNumber,
        timestamp: serverTimestamp(),
      });
      setWeight('');
    } catch (error) {
      console.error('Error adding weight entry: ', error);
      Alert.alert('Error', 'There was an error saving your weight entry.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Weekly Weight Tracking & Goal Prediction</Text>

      {/* Input for logging weight */}
      <View style={styles.inputContainer}>
        <Text>Enter Weight:</Text>
        <TextInput
          style={styles.input}
          value={weight}
          onChangeText={setWeight}
          placeholder="e.g. 180"
          keyboardType="numeric"
        />
        <Button title="Log Weight" onPress={addWeightEntry} />
      </View>

      {/* Input for target weight */}
      <View style={styles.inputContainer}>
        <Text>Set Target Weight:</Text>
        <TextInput
          style={styles.input}
          value={targetWeight}
          onChangeText={setTargetWeight}
          placeholder="e.g. 170"
          keyboardType="numeric"
        />
      </View>

      {/* Display prediction */}
      <View style={styles.predictionContainer}>
        <Text style={styles.predictionText}>
          {targetWeight
            ? prediction !== null
              ? `Estimated weeks remaining: ${prediction}`
              : 'Not enough data for prediction'
            : 'Set your target weight to see prediction'}
        </Text>
      </View>

      {/* List past weight entries */}
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const date = item.timestamp?.toDate().toLocaleDateString() || 'Loading...';
          return (
            <View style={styles.entryItem}>
              <Text>
                {date}: {item.weight} lbs
              </Text>
            </View>
          );
        }}
        style={styles.list}
      />
    </View>
  );
};

export default WeightTrackingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  header: {
    fontSize: 20,
    marginBottom: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  inputContainer: {
    marginVertical: 8,
  },
  input: {
    borderColor: '#666',
    borderWidth: 1,
    padding: 8,
    marginVertical: 4,
    borderRadius: 4,
  },
  predictionContainer: {
    marginVertical: 16,
    padding: 12,
    backgroundColor: '#eef',
    borderRadius: 4,
  },
  predictionText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  list: {
    marginTop: 16,
  },
  entryItem: {
    padding: 8,
    borderBottomColor: '#ddd',
    borderBottomWidth: 1,
  },
});
