import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  StyleSheet,
  Alert,
  Animated,
  Dimensions
} from 'react-native';
import { API_KEY } from '@env';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const SPOONACULAR_API_URL = 'https://api.spoonacular.com/mealplanner/generate';
const SPOONACULAR_RECIPE_URL = 'https://api.spoonacular.com/recipes';
const { width } = Dimensions.get('window');

const MealPlanScreen = () => {
  const [targetCalories, setTargetCalories] = useState('2000');
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recipeDetails, setRecipeDetails] = useState({});
  const [recipeLoading, setRecipeLoading] = useState({});

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  
  // Run entrance animations
  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

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

  const MealCard = ({ meal }) => {
    const imageUrl = `https://spoonacular.com/recipeImages/${meal.id}-312x231.${meal.imageType}`;
    const hasDetails = recipeDetails[meal.id];
    
    return (
      <Animated.View 
        style={[
          styles.card,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <Image source={{ uri: imageUrl }} style={styles.mealImage} resizeMode="cover" />
        <View style={styles.cardContent}>
          <Text style={styles.mealTitle}>{meal.title}</Text>
          <View style={styles.mealStats}>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color="#D4AF37" />
              <Text style={styles.statText}>{meal.readyInMinutes} min</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="people-outline" size={16} color="#D4AF37" />
              <Text style={styles.statText}>{meal.servings} serving{meal.servings !== 1 ? 's' : ''}</Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.recipeButton}
            onPress={() => hasDetails ? hideRecipeDetails(meal.id) : fetchRecipeDetails(meal.id)}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['rgba(212, 175, 55, 0.3)', 'rgba(212, 175, 55, 0.1)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.recipeButtonGradient}
            >
              <Text style={styles.recipeButtonText}>
                {recipeLoading[meal.id] ? "Loading..." : hasDetails ? "Hide Recipe" : "View Recipe"}
              </Text>
              <Ionicons 
                name={hasDetails ? "chevron-up" : "chevron-down"} 
                size={16} 
                color="#D4AF37" 
              />
            </LinearGradient>
          </TouchableOpacity>
          
          {hasDetails && (
            <View style={styles.recipeContainer}>
              <Text style={styles.recipeSectionTitle}>Summary</Text>
              <Text style={styles.recipeSummary}>
                {recipeDetails[meal.id].summary.replace(/<[^>]+>/g, '')}
              </Text>
              
              <Text style={styles.recipeSectionTitle}>Instructions</Text>
              <Text style={styles.recipeInstructions}>
                {recipeDetails[meal.id].instructions
                  ? recipeDetails[meal.id].instructions.replace(/<[^>]+>/g, '')
                  : 'No instructions available.'}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  const NutritionCard = ({ nutrients }) => (
    <Animated.View 
      style={[
        styles.nutritionCard,
        { 
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <LinearGradient
        colors={['rgba(212, 175, 55, 0.3)', 'rgba(212, 175, 55, 0.05)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.nutritionGradient}
      >
        <Text style={styles.nutritionHeader}>Daily Nutrition</Text>
        <View style={styles.nutrientsGrid}>
          <View style={styles.nutrientItem}>
            <Text style={styles.nutrientValue}>{Math.round(nutrients.calories)}</Text>
            <Text style={styles.nutrientLabel}>Calories</Text>
          </View>
          <View style={styles.nutrientItem}>
            <Text style={styles.nutrientValue}>{Math.round(nutrients.protein)}g</Text>
            <Text style={styles.nutrientLabel}>Protein</Text>
          </View>
          <View style={styles.nutrientItem}>
            <Text style={styles.nutrientValue}>{Math.round(nutrients.fat)}g</Text>
            <Text style={styles.nutrientLabel}>Fat</Text>
          </View>
          <View style={styles.nutrientItem}>
            <Text style={styles.nutrientValue}>{Math.round(nutrients.carbohydrates)}g</Text>
            <Text style={styles.nutrientLabel}>Carbs</Text>
          </View>
        </View>
      </LinearGradient>
    </Animated.View>
  );

  return (
    <LinearGradient
      colors={['#1A1A2E', '#16213E', '#0F3460']}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View 
          style={[
            styles.headerContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['rgba(212, 175, 55, 0.3)', 'rgba(212, 175, 55, 0.05)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerGradient}
          >
            <Text style={styles.header}>Personalized Meal Plan</Text>
            <View style={styles.headerDivider} />
            <Text style={styles.headerSubtitle}>Discover perfectly balanced recipes</Text>
          </LinearGradient>
        </Animated.View>
        
        <View style={styles.inputSection}>
          <Text style={styles.label}>Target Calories</Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={targetCalories}
              onChangeText={setTargetCalories}
              keyboardType="numeric"
              placeholder="e.g. 2000"
              placeholderTextColor="rgba(255,255,255,0.5)"
            />
            <TouchableOpacity 
              style={styles.generateButton}
              onPress={generateMealPlan}
              disabled={loading}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#D4AF37', '#F5CC59']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.buttonGradient}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#16213E" />
                ) : (
                  <>
                    <Text style={styles.buttonText}>Generate</Text>
                    <Ionicons name="restaurant-outline" size={16} color="#16213E" />
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
        
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D4AF37" />
            <Text style={styles.loadingText}>Creating your meal plan...</Text>
          </View>
        )}

        {mealPlan && mealPlan.meals && (
          <View style={styles.resultContainer}>
            {mealPlan.nutrients && <NutritionCard nutrients={mealPlan.nutrients} />}
            
            <Text style={styles.mealsHeader}>Today's Meals</Text>
            {mealPlan.meals.map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </View>
        )}
        
        <View style={styles.bottomPadding} />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 20,
  },
  headerContainer: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  headerGradient: {
    padding: 20,
    borderRadius: 16,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  headerDivider: {
    height: 1,
    backgroundColor: 'rgba(212, 175, 55, 0.5)',
    marginVertical: 10,
    width: '60%',
  },
  headerSubtitle: {
    color: '#D4AF37',
    fontSize: 16,
    marginTop: 5,
    fontWeight: '500',
  },
  inputSection: {
    width: '100%',
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 16,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderWidth: 1,
  },
  label: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    color: '#fff',
    marginRight: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    fontSize: 16,
  },
  generateButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  buttonGradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonText: {
    color: '#16213E',
    fontWeight: '700',
    fontSize: 15,
    marginRight: 6,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  loadingText: {
    color: '#D4AF37',
    marginTop: 10,
    fontSize: 16,
  },
  resultContainer: {
    marginBottom: 20,
  },
  nutritionCard: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  nutritionGradient: {
    padding: 16,
    borderRadius: 16,
  },
  nutritionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 16,
    textAlign: 'center',
  },
  nutrientsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  nutrientItem: {
    width: '48%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  nutrientValue: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#D4AF37',
  },
  nutrientLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
    fontSize: 14,
  },
  mealsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  card: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    borderColor: 'rgba(212, 175, 55, 0.3)',
    borderWidth: 1,
  },
  mealImage: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 16,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  mealStats: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  statText: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
  },
  recipeButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 8,
  },
  recipeButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  recipeButtonText: {
    color: '#D4AF37',
    fontWeight: '500',
    marginRight: 6,
  },
  recipeContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(212, 175, 55, 0.3)',
  },
  recipeSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#D4AF37',
    marginBottom: 6,
    marginTop: 12,
  },
  recipeSummary: {
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    fontSize: 14,
  },
  recipeInstructions: {
    color: 'rgba(255, 255, 255, 0.7)',
    lineHeight: 20,
    fontSize: 14,
  },
  bottomPadding: {
    height: 30,
  }
});

export default MealPlanScreen;