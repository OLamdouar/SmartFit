import React, { useContext } from 'react';
import { ScrollView, Text, StyleSheet } from 'react-native';
import { AuthContext } from '../context/AuthContext';

export default function MealPlanScreen() {
  const { userData } = useContext(AuthContext);

  const renderMealPlan = () => {
    if (userData && userData.goal) {
      const goal = userData.goal.toLowerCase();
      
      if (goal.includes('lose')) {
        return (
          <>
            <Text style={styles.planTitle}>Weight Loss Meal Plan:</Text>
            <Text style={styles.planItem}>
              Breakfast: Oatmeal with berries{"\n"}
              Calories: 350 kcal | Protein: 10g | Carbs: 60g | Fats: 5g
            </Text>
            <Text style={styles.planItem}>
              Mid-Morning: Green smoothie{"\n"}
              Calories: 200 kcal | Protein: 5g | Carbs: 40g | Fats: 2g
            </Text>
            <Text style={styles.planItem}>
              Lunch: Grilled chicken salad with quinoa{"\n"}
              Calories: 450 kcal | Protein: 35g | Carbs: 45g | Fats: 15g
            </Text>
            <Text style={styles.planItem}>
              Afternoon: Apple and almonds{"\n"}
              Calories: 250 kcal | Protein: 6g | Carbs: 30g | Fats: 12g
            </Text>
            <Text style={styles.planItem}>
              Dinner: Steamed vegetables with tofu{"\n"}
              Calories: 400 kcal | Protein: 20g | Carbs: 50g | Fats: 10g
            </Text>
            <Text style={styles.planItem}>
              Evening: Herbal tea{"\n"}
              Calories: 0 kcal | Protein: 0g | Carbs: 0g | Fats: 0g
            </Text>
          </>
        );
      } else if (goal.includes('gain')) {
        return (
          <>
            <Text style={styles.planTitle}>Muscle Gain Meal Plan:</Text>
            <Text style={styles.planItem}>
              Breakfast: Scrambled eggs with whole-grain toast and avocado{"\n"}
              Calories: 500 kcal | Protein: 25g | Carbs: 45g | Fats: 20g
            </Text>
            <Text style={styles.planItem}>
              Mid-Morning: Greek yogurt with granola{"\n"}
              Calories: 350 kcal | Protein: 20g | Carbs: 50g | Fats: 8g
            </Text>
            <Text style={styles.planItem}>
              Lunch: Grilled salmon, brown rice, and steamed broccoli{"\n"}
              Calories: 600 kcal | Protein: 40g | Carbs: 60g | Fats: 20g
            </Text>
            <Text style={styles.planItem}>
              Afternoon: Protein shake and banana{"\n"}
              Calories: 400 kcal | Protein: 30g | Carbs: 50g | Fats: 5g
            </Text>
            <Text style={styles.planItem}>
              Dinner: Lean steak with sweet potato and salad{"\n"}
              Calories: 700 kcal | Protein: 45g | Carbs: 65g | Fats: 25g
            </Text>
            <Text style={styles.planItem}>
              Evening: Cottage cheese with pineapple{"\n"}
              Calories: 300 kcal | Protein: 20g | Carbs: 30g | Fats: 5g
            </Text>
          </>
        );
      } else {
        return <Text>Your goal is not recognized. Please update your profile.</Text>;
      }
    } else {
      return <Text>Loading meal plan...</Text>;
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {renderMealPlan()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  planTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center'
  },
  planItem: {
    fontSize: 16,
    marginVertical: 10,
    textAlign: 'left'
  }
});
