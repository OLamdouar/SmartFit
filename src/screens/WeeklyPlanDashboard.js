import React, { useContext } from 'react';
import { ScrollView, Text, View, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function WeeklyPlanDashboard() {
  const { userData } = useContext(AuthContext);

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // One workout per day – static arrays for simplicity
  const workoutPlans = {
    gain: [
      "Chest & Triceps", 
      "Back & Biceps", 
      "Rest or Light Cardio", 
      "Shoulders & Abs", 
      "Legs", 
      "Full Body Circuit", 
      "Rest"
    ],
    lose: [
      "HIIT Cardio", 
      "Full Body Strength", 
      "Moderate Cardio", 
      "Circuit Training", 
      "HIIT Cardio", 
      "Yoga/Active Recovery", 
      "Rest"
    ]
  };

  // Full meal plan for each day – multiple meals per day
  const defaultMealPlanLose = [
    "Breakfast: Oatmeal with berries – 350 kcal | Protein: 10g | Carbs: 60g | Fats: 5g",
    "Morning Snack: Green smoothie – 200 kcal | Protein: 5g | Carbs: 40g | Fats: 2g",
    "Lunch: Grilled chicken salad with quinoa – 450 kcal | Protein: 35g | Carbs: 45g | Fats: 15g",
    "Afternoon Snack: Apple with almonds – 250 kcal | Protein: 6g | Carbs: 30g | Fats: 12g",
    "Dinner: Steamed vegetables with tofu – 400 kcal | Protein: 20g | Carbs: 50g | Fats: 10g",
    "Evening: Herbal tea – 0 kcal"
  ];

  const defaultMealPlanGain = [
    "Breakfast: Scrambled eggs, toast & avocado – 500 kcal | Protein: 25g | Carbs: 45g | Fats: 20g",
    "Morning Snack: Greek yogurt with granola – 350 kcal | Protein: 20g | Carbs: 50g | Fats: 8g",
    "Lunch: Grilled salmon, brown rice, & steamed broccoli – 600 kcal | Protein: 40g | Carbs: 60g | Fats: 20g",
    "Afternoon Snack: Protein shake with banana – 400 kcal | Protein: 30g | Carbs: 50g | Fats: 5g",
    "Dinner: Lean steak with sweet potato & salad – 700 kcal | Protein: 45g | Carbs: 65g | Fats: 25g",
    "Evening: Cottage cheese with pineapple – 300 kcal | Protein: 20g | Carbs: 30g | Fats: 5g"
  ];

  // Determine which meal plan to use based on user goal
  let mealPlanForDay = defaultMealPlanLose;
  if (userData && userData.goal) {
    const goal = userData.goal.toLowerCase();
    if (goal.includes('gain')) {
      mealPlanForDay = defaultMealPlanGain;
    } else if (goal.includes('lose')) {
      mealPlanForDay = defaultMealPlanLose;
    }
  }

  // Determine which workout plan to use based on user goal
  let workoutPlanForWeek = workoutPlans.lose; // default to "lose"
  if (userData && userData.goal && userData.goal.toLowerCase().includes('gain')) {
    workoutPlanForWeek = workoutPlans.gain;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Weekly Plan Dashboard</Text>
      {days.map((day, index) => (
        <View key={index} style={styles.dayContainer}>
          <Text style={styles.dayTitle}>{day}</Text>
          <Text style={styles.subTitle}>Workout:</Text>
          <Text style={styles.planDetail}>{workoutPlanForWeek[index]}</Text>

          <Text style={styles.subTitle}>Meal Plan:</Text>
          {mealPlanForDay.map((meal, i) => (
            <Text key={i} style={styles.mealItem}>{meal}</Text>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff"
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center"
  },
  dayContainer: {
    marginBottom: 15,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8
  },
  dayTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 10
  },
  planDetail: {
    fontSize: 16,
    marginLeft: 10,
    marginVertical: 5
  },
  mealItem: {
    fontSize: 16,
    marginLeft: 20,
    marginVertical: 2
  }
});
