import 'dotenv/WorkoutPlanAIScreen';
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  Image,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform
} from 'react-native';

W_BASE: process.env.W_BASE

const LANGUAGE = 2; 

// Map user-friendly muscle names to Wger muscle IDs
const MUSCLE_MAP = {
  biceps: 1,
  triceps: 2,
  shoulders: 3,
  chest: 5,
  back: 7,
  abdominals: 6,
  legs: 9,      
  calves: 11,
  forearms: 12,
  glutes: 8,
  hamstrings: 10,
};

export default function WorkoutPlanAIScreen() {
  const [day, setDay] = useState('Monday');
  const [muscles, setMuscles] = useState('Back, Biceps');
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch exercise list for a given muscle ID
  const fetchExercises = async (muscleId) => {
    const url = `${WGER_BASE}/exercise?language=${LANGUAGE}&muscles=${muscleId}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load exercises (${res.status})`);
    const json = await res.json();
    return json.results; // array of { id, name, description, ... }
  };

  // Fetch first image URL for an exercise
  const fetchExerciseImage = async (exerciseId) => {
    const url = `${WGER_BASE}/exerciseimage?exercise=${exerciseId}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const json = await res.json();
    return json.results[0]?.image || null;
  };

  const generatePlan = async () => {
    setLoading(true);
    setPlan(null);

    // parse user input muscles into array & map to IDs
    const muscleList = muscles
      .split(',')
      .map(m => m.trim().toLowerCase())
      .filter(m => MUSCLE_MAP[m])
      .map(m => ({ name: m, id: MUSCLE_MAP[m] }));

    if (muscleList.length === 0) {
      Alert.alert('Input Error', 'Please enter valid muscle groups (e.g. Back, Biceps).');
      setLoading(false);
      return;
    }

    try {
      const results = [];
      for (let { name, id } of muscleList) {
        const exs = await fetchExercises(id);
        if (!exs.length) continue;
        // pick random exercise
        const choice = exs[Math.floor(Math.random() * exs.length)];
        // get image if any
        let img = null;
        try {
          img = await fetchExerciseImage(choice.id);
        } catch {}
        // assign default sets/reps
        results.push({
          name: choice.name,
          sets: '3 sets x 10 reps',
          image: img,
        });
      }

      if (!results.length) {
        Alert.alert('No Exercises', 'No exercises found for those muscle groups.');
      } else {
        setPlan({ day, muscles: muscleList.map(m => m.name), exercises: results });
      }
    } catch (err) {
      Alert.alert('Error', err.message);
    }

    setLoading(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Workout Planner</Text>

      <View style={styles.inputRow}>
        <Text style={styles.label}>Day:</Text>
        <TextInput
          style={styles.input}
          value={day}
          onChangeText={setDay}
          placeholder="e.g. Monday"
          placeholderTextColor="#888"
        />
      </View>

      <View style={styles.inputRow}>
        <Text style={styles.label}>Muscles:</Text>
        <TextInput
          style={styles.input}
          value={muscles}
          onChangeText={setMuscles}
          placeholder="e.g. Back, Biceps"
          placeholderTextColor="#888"
        />
      </View>

      <Button title="Generate Plan" onPress={generatePlan} color="#D4AF37" />
      {loading && <ActivityIndicator style={styles.loading} size="large" />}

      {plan && (
        <View style={styles.plan}>
          <Text style={styles.planHeader}>
            {plan.day}: {plan.muscles.join(', ')}
          </Text>
          {plan.exercises.map((ex, i) => (
            <View key={i} style={styles.exercise}>
              <Text style={styles.exerciseText}>
                {ex.sets} — {ex.name}
              </Text>
              {ex.image ? (
                <Image source={{ uri: ex.image }} style={styles.image} />
              ) : (
                <Text style={styles.noImage}>No image</Text>
              )}
            </View>
          ))}
        </View>
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
  inputRow: {
    width: '100%',
    marginBottom: 12,
  },
  label: {
    color: '#fff',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#1c1c1c',
    color: '#fff',
    borderColor: '#D4AF37',
    borderWidth: 1,
    borderRadius: 6,
    padding: Platform.OS === 'ios' ? 12 : 8,
  },
  loading: {
    marginVertical: 20,
  },
  plan: {
    marginTop: 20,
    width: '100%',
  },
  planHeader: {
    fontSize: 20,
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  exercise: {
    marginBottom: 16,
    alignItems: 'center',
  },
  exerciseText: {
    color: '#fff',
    marginBottom: 6,
  },
  image: {
    width: 200,
    height: 120,
    borderRadius: 6,
  },
  noImage: {
    color: '#888',
    fontStyle: 'italic',
  },
});
