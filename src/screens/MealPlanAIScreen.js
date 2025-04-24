import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert
} from 'react-native';
import { API_KEY } from '@env'; // ✅ Import API_KEY from .env

const SPOONACULAR_API_URL = 'https://api.spoonacular.com/mealplanner/generate';
const SPOONACULAR_RECIPE_URL = 'https://api.spoonacular.com/recipes';

const MealPlanSpoonacularScreen = () => {
  const [targetCalories, setTargetCalories] = useState('2000');
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recipeDetails, setRecipeDetails] = useState({});
  const [recipeLoading, setRecipeLoading] = useState({});

  const generateMealPlan = async () => {
    setLoading(true);
    setMealPlan(null);
    setRecipeDetails({});
    try {
      const response = await fetch(
        `${SPOONACULAR_API_URL}?timeFrame=day&targetCalories=${targetCalories}&apiKey=${API_KEY}`
      );
      if (!response.ok) throw new Error(`Error: ${response.statusText}`);
      const data = await response.json();
      setMealPlan(data);
    } catch (error) {
      Alert.alert('Error', error.message);
      console.error('Error generating meal plan: ', error);
    }
    setLoading(false);
  };

  const fetchRecipeDetails = async (mealId) => {
    setRecipeLoading((prev) => ({ ...prev, [mealId]: true }));
    try {
      const response = await fetch(
        `${SPOONACULAR_RECIPE_URL}/${mealId}/information?apiKey=${API_KEY}`
      );
      if (!response.ok) throw new Error(`Failed to fetch recipe details: ${response.statusText}`);
      const data = await response.json();
      setRecipeDetails((prev) => ({ ...prev, [mealId]: data }));
    } catch (error) {
      Alert.alert('Error', error.message);
      console.error('Error fetching recipe details for meal', mealId, error);
    }
    setRecipeLoading((prev) => ({ ...prev, [mealId]: false }));
  };

  const hideRecipeDetails = (mealId) => {
    setRecipeDetails((prev) => {
      const newState = { ...prev };
      delete newState[mealId];
      return newState;
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>Meal Plan Generator</Text>
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Target Calories:</Text>
        <TextInput
          style={styles.input}
          value={targetCalories}
          onChangeText={setTargetCalories}
          keyboardType="numeric"
          placeholder="e.g. 2000"
          placeholderTextColor="#888"
        />
      </View>
      <Button title="Generate Meal Plan" onPress={generateMealPlan} color="#D4AF37" />
      {loading && <ActivityIndicator size="large" style={styles.loading} />}

      {mealPlan && (
        <View style={styles.mealPlanContainer}>
          <Text style={styles.planHeader}>Meal Plan for Today</Text>
          {mealPlan.meals && mealPlan.meals.map((meal) => {
            const imageUrl = `https://spoonacular.com/recipeImages/${meal.id}-312x231.${meal.imageType}`;
            return (
              <View key={meal.id} style={styles.mealItem}>
                <Text style={styles.mealTitle}>{meal.title}</Text>
                <Text>
                  Ready in {meal.readyInMinutes} minutes | Serves: {meal.servings}
                </Text>
                <Image source={{ uri: imageUrl }} style={styles.mealImage} resizeMode="cover" />
                {recipeDetails[meal.id] ? (
                  <>
                    <Button title="Hide Recipe" onPress={() => hideRecipeDetails(meal.id)} color="#D4AF37" />
                    <View style={styles.recipeContainer}>
                      <Text style={styles.recipeTitle}>{recipeDetails[meal.id].title}</Text>
                      <Text style={styles.recipeSummary}>
                        {recipeDetails[meal.id].summary.replace(/<[^>]+>/g, '')}
                      </Text>
                      <Text style={styles.recipeInstructions}>
                        Instructions: {recipeDetails[meal.id].instructions
                          ? recipeDetails[meal.id].instructions.replace(/<[^>]+>/g, '')
                          : 'No instructions available.'}
                      </Text>
                    </View>
                  </>
                ) : (
                  <Button
                    title={recipeLoading[meal.id] ? "Loading Recipe..." : "Show Recipe"}
                    onPress={() => fetchRecipeDetails(meal.id)}
                    color="#D4AF37"
                  />
                )}
              </View>
            );
          })}
          {mealPlan.nutrients && (
            <View style={styles.nutrientsContainer}>
              <Text style={styles.nutrientsText}>Calories: {mealPlan.nutrients.calories}</Text>
              <Text style={styles.nutrientsText}>Protein: {mealPlan.nutrients.protein}g</Text>
              <Text style={styles.nutrientsText}>Fat: {mealPlan.nutrients.fat}g</Text>
              <Text style={styles.nutrientsText}>Carbs: {mealPlan.nutrients.carbohydrates}g</Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
};

export default MealPlanSpoonacularScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#141414',
    alignItems: 'center',
  },
  header: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#D4AF37',
  },
  inputContainer: {
    marginVertical: 8,
    width: '100%',
  },
  label: {
    color: '#fff',
    marginBottom: 4,
  },
  input: {
    borderColor: '#D4AF37',
    borderWidth: 1,
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
    color: '#fff',
    backgroundColor: '#1c1c1c',
  },
  loading: {
    marginVertical: 20,
  },
  mealPlanContainer: {
    marginTop: 16,
    width: '100%',
  },
  planHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
    color: '#fff',
  },
  mealItem: {
    marginBottom: 12,
    borderBottomColor: '#333',
    borderBottomWidth: 1,
    paddingBottom: 12,
    alignItems: 'center',
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  mealImage: {
    width: 300,
    height: 200,
    marginTop: 8,
    borderRadius: 6,
  },
  recipeContainer: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#1c1c1c',
    borderRadius: 4,
    width: '90%',
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  recipeSummary: {
    fontSize: 14,
    marginVertical: 4,
    color: '#fff',
  },
  recipeInstructions: {
    fontSize: 14,
    marginVertical: 4,
    color: '#fff',
  },
  nutrientsContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  nutrientsText: {
    fontSize: 16,
    marginVertical: 2,
    color: '#fff',
  },
});
