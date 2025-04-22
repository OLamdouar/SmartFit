import React, { useContext } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function WorkoutPlanScreen() {
  const { userData } = useContext(AuthContext);

  const renderWorkoutPlan = () => {
    if (userData && userData.goal) {
      
      const goal = userData.goal.toLowerCase();
      
      if (goal.includes('gain')) {
        return (
          <>
            <Text style={styles.planTitle}>Muscle Gain Workout Plan:</Text>
            <Text style={styles.planItem}>Monday: Chest & Triceps</Text>
            <Text style={styles.planItem}>Tuesday: Back & Biceps</Text>
            <Text style={styles.planItem}>Wednesday: Rest or Light Cardio</Text>
            <Text style={styles.planItem}>Thursday: Shoulders & Abs</Text>
            <Text style={styles.planItem}>Friday: Legs</Text>
            <Text style={styles.planItem}>Saturday: Full Body Circuit</Text>
            <Text style={styles.planItem}>Sunday: Rest</Text>
          </>
        );
      } else if (goal.includes('lose')) {
        return (
          <>
            <Text style={styles.planTitle}>Weight Loss Workout Plan:</Text>
            <Text style={styles.planItem}>Monday: HIIT Cardio</Text>
            <Text style={styles.planItem}>Tuesday: Full Body Strength</Text>
            <Text style={styles.planItem}>Wednesday: Moderate Cardio</Text>
            <Text style={styles.planItem}>Thursday: Circuit Training</Text>
            <Text style={styles.planItem}>Friday: HIIT Cardio</Text>
            <Text style={styles.planItem}>Saturday: Yoga/Active Recovery</Text>
            <Text style={styles.planItem}>Sunday: Rest</Text>
          </>
        );
      } else {
        return <Text>Your goal is not recognized. Please update your profile.</Text>;
      }
    } else {
      return <Text>Loading workout plan...</Text>;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {renderWorkoutPlan()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  planTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  planItem: {
    fontSize: 18,
    marginVertical: 5,
  },
});
