import React, { useState } from 'react';
import {
  View,
  Text,
  Button,
  Image,
  ScrollView,
  StyleSheet
} from 'react-native';

// 1) Map each muscle → its 4 local GIFs (in the same order as names below)
const GIFS = {
  back: [
    require('../../assets/exercises/back1.gif'),
    require('../../assets/exercises/back2.gif'),
    require('../../assets/exercises/back3.gif'),
    require('../../assets/exercises/back4.gif'),
  ],
  chest: [
    require('../../assets/exercises/chest1.gif'),
    require('../../assets/exercises/chest2.gif'),
    require('../../assets/exercises/chest3.gif'),
    require('../../assets/exercises/chest4.gif'),
  ],
};

// 2) Provide matching exercise names in the same order
const EXERCISES = {
  back: [
    'Dumbbell Row',
    'Barbell Bent Over Rowp',
    'Lat Pulldown',
    'Barbell Row',
  ],
  biceps: [
    'Dumbbell Curl',
    'Hammer Curl',
    'Preacher Curl',
    'Concentration Curl',
  ],
  triceps: [
    'Tricep Dip',
    'Overhead Tricep Extension',
    'Cable Pushdown',
    'Skull Crusher',
  ],
  chest: [
    'Incline Barbell Bench Press',
    'Dumbbell Bench Press',
    'Chest Dip',
    'Push-Up',
  ],
  abs: [
    'Crunch',
    'Leg Raise',
    'Plank',
    'Bicycle Crunch',
  ],
  shoulders: [
    'Overhead Press',
    'Lateral Raise',
    'Front Raise',
    'Rear Delt Fly',
  ],
  quads: [
    'Squat',
    'Lunge',
    'Leg Press',
    'Leg Extension',
  ],
  calves: [
    'Standing Calf Raise',
    'Seated Calf Raise',
    'Donkey Calf Raise',
    'Calf Press',
  ],
};

// helper to title‐case
const titleCase = s => s.charAt(0).toUpperCase() + s.slice(1);

export default function WorkoutPlanAiScreen() {
  const [plan, setPlan]       = useState([]);
  const [selectedMuscle, setSelectedMuscle] = useState(null);

  const handlePress = (muscle) => {
    setSelectedMuscle(muscle);
    const names = EXERCISES[muscle] || [];
    const gifs  = GIFS[muscle]      || [];
    const items = names.map((name, i) => ({
      name,
      sets: '3 sets x 10 reps',
      gif: gifs[i] || null,
    }));
    setPlan(items);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Workout Planner</Text>
      <Text style={styles.subHeader}>Tap a muscle to generate your plan</Text>

      <View style={styles.buttonRow}>
        {Object.keys(EXERCISES).map(m => (
          <View key={m} style={styles.btnWrapper}>
            <Button
              title={titleCase(m)}
              color="#D4AF37"
              onPress={() => handlePress(m)}
            />
          </View>
        ))}
      </View>

      {selectedMuscle && (
        <View style={styles.plan}>
          {plan.map((ex, i) => (
            <View key={i} style={styles.exercise}>
              <Text style={styles.exerciseText}>
                {ex.sets} — {ex.name}
              </Text>
              {ex.gif && (
                <Image source={ex.gif} style={styles.gif} />
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
    alignItems: 'center'
  },
  header: {
    fontSize: 24,
    color: '#D4AF37',
    fontWeight: 'bold',
    marginBottom: 4
  },
  subHeader: {
    color: '#fff',
    marginBottom: 12
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center'
  },
  btnWrapper: {
    margin: 6,
    width: '40%'
  },
  plan: {
    marginTop: 24,
    width: '100%'
  },
  exercise: {
    marginBottom: 20,
    alignItems: 'center'
  },
  exerciseText: {
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center'
  },
  gif: {
    width: 250,
    height: 140,
    borderRadius: 6
  }
});
