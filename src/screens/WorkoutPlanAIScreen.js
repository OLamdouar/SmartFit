import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  ScrollView,
  StyleSheet,
  Dimensions,
  Animated,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

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
    'Barbell Bent Over Row',
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
const { width } = Dimensions.get('window');

export default function WorkoutPlanAiScreen() {
  const [plan, setPlan] = useState([]);
  const [selectedMuscle, setSelectedMuscle] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const cardAnimations = useRef({}).current;
  const headerScaleAnim = useRef(new Animated.Value(0.9)).current;
  
  useEffect(() => {
    // Run entrance animations
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
      Animated.spring(headerScaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  const handlePress = (muscle) => {
    setLoading(true);
    // Simulate loading for a better UX
    setTimeout(() => {
      setSelectedMuscle(muscle);
      const names = EXERCISES[muscle] || [];
      const gifs = GIFS[muscle] || [];
      const items = names.map((name, i) => {
        const id = `${muscle}-${i}`;
        // Create animation value for new item if it doesn't exist
        if (!cardAnimations[id]) {
          cardAnimations[id] = new Animated.Value(0);
        }
        
        return {
          id,
          name,
          sets: '3 sets x 10 reps',
          gif: gifs[i] || null,
        };
      });
      
      setPlan(items);
      setLoading(false);
      
      // Animate each card with a staggered delay
      items.forEach((item, index) => {
        Animated.timing(cardAnimations[item.id], {
          toValue: 1,
          duration: 300,
          delay: index * 100,
          useNativeDriver: true,
        }).start();
      });
    }, 600);
  };

  return (
    <LinearGradient
      colors={['#1A1A2E', '#16213E', '#0F3460']}
      style={styles.container}
    >
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Updated Header with different styling and no date */}
        <Animated.View 
          style={[
            styles.welcomeHeader,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: headerScaleAnim }
              ]
            }
          ]}
        >
          <LinearGradient
            colors={['rgba(70, 130, 180, 0.4)', 'rgba(70, 130, 180, 0.1)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.welcomeGradient}
          >
            <Text style={styles.greeting}>Personalized Training</Text>
            <Text style={styles.nameText}>Your Exercise Guide</Text>
            <View style={styles.welcomeDivider} />
            <Text style={styles.welcomeSubtitle}>Choose your target muscle group</Text>
          </LinearGradient>
        </Animated.View>

        {/* Muscle Group Buttons */}
        <Animated.View 
          style={[
            styles.muscleGrid,
            { 
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }] 
            }
          ]}
        >
          {Object.keys(EXERCISES).map((muscle) => (
            <TouchableOpacity
              key={muscle}
              style={[
                styles.muscleButton,
                selectedMuscle === muscle && styles.selectedMuscleButton
              ]}
              onPress={() => handlePress(muscle)}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={selectedMuscle === muscle 
                  ? ['#4682B4', '#87CEEB'] 
                  : ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.muscleGradient}
              >
                <Text 
                  style={[
                    styles.muscleButtonText,
                    selectedMuscle === muscle && styles.selectedMuscleButtonText
                  ]}
                >
                  {titleCase(muscle)}
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          ))}
        </Animated.View>
        
        {/* Loading Indicator */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4682B4" />
            <Text style={styles.loadingText}>Loading exercises...</Text>
          </View>
        )}

        {/* Workout Plan Section */}
        {selectedMuscle && !loading && (
          <View style={styles.planContainer}>
            <Animated.View 
              style={[
                styles.planHeader,
                { opacity: fadeAnim }
              ]}
            >
              <Text style={styles.planTitle}>{titleCase(selectedMuscle)} Workout</Text>
              <Text style={styles.planSubtitle}>Recommended exercises for optimal growth</Text>
            </Animated.View>
            
            {plan.map((exercise, index) => (
              <Animated.View 
                key={exercise.id}
                style={[
                  styles.exerciseCard,
                  { 
                    opacity: cardAnimations[exercise.id],
                    transform: [{ 
                      translateY: cardAnimations[exercise.id].interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0]
                      })
                    }]
                  }
                ]}
              >
                <LinearGradient
                  colors={['rgba(70, 130, 180, 0.2)', 'rgba(70, 130, 180, 0.05)']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.exerciseGradient}
                >
                  <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseName}>{exercise.name}</Text>
                    <Text style={styles.exerciseSets}>{exercise.sets}</Text>
                  </View>
                  
                  {exercise.gif && (
                    <View style={styles.gifContainer}>
                      <Image source={exercise.gif} style={styles.gif} resizeMode="cover" />
                    </View>
                  )}
                  
                  <TouchableOpacity style={styles.addToRoutineButton} activeOpacity={0.8}>
                    <LinearGradient
                      colors={['#4682B4', '#87CEEB']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.addButtonGradient}
                    >
                      <Text style={styles.addButtonText}>Add to Routine</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </LinearGradient>
              </Animated.View>
            ))}
          </View>
        )}
        
        {/* Show empty state if no muscle is selected */}
        {!selectedMuscle && !loading && (
          <View style={styles.emptyStateContainer}>
            <Text style={styles.emptyStateText}>
              Select a muscle group above to view recommended exercises
            </Text>
          </View>
        )}
        
        {/* Add extra padding at the bottom */}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 48,
  },
  welcomeHeader: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
  },
  welcomeGradient: {
    padding: 20,
    borderRadius: 16,
  },
  greeting: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '500',
    opacity: 0.9,
  },
  nameText: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 3,
    marginBottom: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  welcomeDivider: {
    height: 1,
    backgroundColor: 'rgba(70, 130, 180, 0.5)',
    marginVertical: 10,
    width: '60%',
  },
  welcomeSubtitle: {
    color: '#87CEEB',
    fontSize: 16,
    marginTop: 5,
    fontWeight: '500',
  },
  muscleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  muscleButton: {
    width: '48%',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  muscleGradient: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  selectedMuscleButton: {
    borderWidth: 1,
    borderColor: '#4682B4',
  },
  muscleButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  selectedMuscleButtonText: {
    color: '#000',
  },
  loadingContainer: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#4682B4',
    fontSize: 16,
    marginTop: 12,
    fontWeight: '500',
  },
  planContainer: {
    marginTop: 8,
    width: '100%',
  },
  planHeader: {
    marginBottom: 16,
    alignItems: 'center',
  },
  planTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  planSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  exerciseCard: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
  },
  exerciseGradient: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  exerciseHeader: {
    padding: 16,
    paddingBottom: 12,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exerciseSets: {
    color: '#4682B4',
    fontSize: 14,
  },
  gifContainer: {
    width: '100%',
    height: 180,
    backgroundColor: '#0E0E0E',
  },
  gif: {
    width: '100%',
    height: '100%',
  },
  emptyStateContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  addToRoutineButton: {
    margin: 12,
    borderRadius: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 4,
  },
  addButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButtonText: {
    color: '#16213E',
    fontWeight: '700',
    fontSize: 14,
  },
  bottomPadding: {
    height: 50,
  },
});