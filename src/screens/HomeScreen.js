import React, { useState, useContext, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Keyboard,
  Dimensions,
  Animated,
  ActivityIndicator,
  PanResponder,
  ScrollView,
  ImageBackground
} from 'react-native';
import * as Progress from 'react-native-progress';
import { PieChart } from 'react-native-chart-kit';
import { AuthContext } from '../context/AuthContext';
import { NIX_ID, NIX_KEY } from '@env';
import { LinearGradient } from 'expo-linear-gradient';

const calcBMR = (w, h, a) => 10 * w + 6.25 * h - 5 * a + 5;
const ACTIVITY = 1.55;
const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const { userData } = useContext(AuthContext);
  const firstName = userData?.fullName?.split(' ')[0] || 'User';

  const [dailyGoal, setDailyGoal] = useState(0);
  const [mealInput, setMealInput] = useState('');
  const [meals, setMeals] = useState([]); // { name, calories, protein, carbs, fat }
  const [exInput, setExInput] = useState('');
  const [exs, setExs] = useState([]); // { name, calories }
  const [loading, setLoading] = useState(false);
  const [expandedView, setExpandedView] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const circleAnim = useRef(new Animated.Value(0)).current;
  const listItemAnim = useRef({}).current;
  const slideUpDownAnim = useRef(new Animated.Value(0)).current;
  const slideIndicatorOpacity = useRef(new Animated.Value(1)).current;
  const welcomeScaleAnim = useRef(new Animated.Value(0.9)).current;

  // Set up pan responder for sliding gesture - now applied to the whole page
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 20;
      },
      onPanResponderGrant: () => {
        // Animate slide indicator when user starts dragging
        Animated.timing(slideIndicatorOpacity, {
          toValue: 0.5,
          duration: 150,
          useNativeDriver: true,
        }).start();
      },
      onPanResponderMove: (_, gestureState) => {
        // Limit the slide distance
        const newValue = Math.max(-200, Math.min(0, slideUpDownAnim._value + gestureState.dy));
        slideUpDownAnim.setValue(newValue);
      },
      onPanResponderRelease: (_, gestureState) => {
        // Reset slide indicator animation
        Animated.timing(slideIndicatorOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }).start();

        // Determine if we should snap to expanded or collapsed state
        if (gestureState.dy < -50 && expandedView) {
          // Snap to collapsed (up)
          Animated.spring(slideUpDownAnim, {
            toValue: -200,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }).start(() => setExpandedView(false));
        } else if (gestureState.dy > 50 && !expandedView) {
          // Snap to expanded (down)
          Animated.spring(slideUpDownAnim, {
            toValue: 0,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }).start(() => setExpandedView(true));
        } else {
          // Snap back to current state
          Animated.spring(slideUpDownAnim, {
            toValue: expandedView ? 0 : -200,
            friction: 8,
            tension: 40,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

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
      Animated.spring(circleAnim, {
        toValue: 1,
        friction: 7,
        tension: 40,
        useNativeDriver: true,
      }),
      Animated.spring(welcomeScaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      })
    ]).start();

    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!userData) return;
    const w = Number(userData.weight),
      h = Number(userData.height),
      a = Number(userData.age),
      tw = Number(userData.targetWeight);

    let tdee = calcBMR(w, h, a) * ACTIVITY;
    tdee = tw > w ? tdee + 500 : tdee - 500;
    setDailyGoal(Math.round(tdee));
  }, [userData]);

  const toggleExpandCollapse = () => {
    // Toggle between expanded and collapsed states
    Animated.spring(slideUpDownAnim, {
      toValue: expandedView ? -200 : 0,
      friction: 8,
      tension: 40,
      useNativeDriver: true,
    }).start(() => setExpandedView(!expandedView));
  };

  const nixFetch = async (url, body) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-id': NIX_ID,
        'x-app-key': NIX_KEY
      },
      body: JSON.stringify(body)
    });
    if (!res.ok) throw new Error(res.statusText);
    return res.json();
  };

  const addMeal = async () => {
    if (!mealInput.trim()) return Alert.alert('Enter meal');
    setLoading(true);
    try {
      const data = await nixFetch(
        'https://trackapi.nutritionix.com/v2/natural/nutrients',
        { query: mealInput }
      );
      const calories = data.foods.reduce((s, f) => s + (f.nf_calories || 0), 0);
      const protein = data.foods.reduce((s, f) => s + (f.nf_protein || 0), 0);
      const carbs = data.foods.reduce((s, f) => s + (f.nf_total_carbohydrate || 0), 0);
      const fat = data.foods.reduce((s, f) => s + (f.nf_total_fat || 0), 0);

      const newMeal = {
        name: mealInput,
        calories: Math.round(calories),
        protein: Math.round(protein),
        carbs: Math.round(carbs),
        fat: Math.round(fat),
        id: Date.now().toString()
      };

      // Create animation value for new item
      listItemAnim[newMeal.id] = new Animated.Value(0);

      setMeals(m => [newMeal, ...m]);

      // Animate new item
      Animated.timing(listItemAnim[newMeal.id], {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setMealInput('');
      Keyboard.dismiss();
    } catch (e) {
      Alert.alert('Error fetching meal', e.message);
    }
    setLoading(false);
  };

  const addEx = async () => {
    if (!exInput.trim()) return Alert.alert('Enter exercise');
    setLoading(true);
    try {
      const data = await nixFetch(
        'https://trackapi.nutritionix.com/v2/natural/exercise',
        { query: exInput }
      );
      const calories = data.exercises.reduce((s, x) => s + (x.nf_calories || 0), 0);
      
      const newEx = {
        name: exInput,
        calories: Math.round(calories),
        id: Date.now().toString()
      };

      // Create animation value for new item
      listItemAnim[newEx.id] = new Animated.Value(0);

      setExs(e => [newEx, ...e]);

      // Animate new item
      Animated.timing(listItemAnim[newEx.id], {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      setExInput('');
      Keyboard.dismiss();
    } catch (e) {
      Alert.alert('Error fetching exercise', e.message);
    }
    setLoading(false);
  };

  const consumed = meals.reduce((s, m) => s + m.calories, 0);
  const burned = exs.reduce((s, x) => s + x.calories, 0);
  const remaining = Math.max(dailyGoal - consumed + burned, 0);
  const progress = dailyGoal > 0 ? consumed / dailyGoal : 0;

  const proteinTotal = meals.reduce((s, m) => s + m.protein, 0);
  const carbsTotal = meals.reduce((s, m) => s + m.carbs, 0);
  const fatTotal = meals.reduce((s, m) => s + m.fat, 0);
  const pieData = [
    { name: 'Protein', population: proteinTotal, color: '#D4AF37', legendFontColor: '#fff', legendFontSize: 14 },
    { name: 'Carbs', population: carbsTotal, color: '#4CAF50', legendFontColor: '#fff', legendFontSize: 14 },
    { name: 'Fat', population: fatTotal, color: '#F44336', legendFontColor: '#fff', legendFontSize: 14 },
  ];

  // Format current time for greeting
  const hours = currentTime.getHours();
  let greeting = "Good morning";
  if (hours >= 12 && hours < 18) greeting = "Good afternoon";
  else if (hours >= 18) greeting = "Good evening";

  // Get current date
  const today = new Date();
  const options = { weekday: 'long', month: 'long', day: 'numeric' };
  const formattedDate = today.toLocaleDateString('en-US', options);

  // Prepare the entries data
  const entriesData = [
    ...meals.map(m => ({ ...m, type: 'food' })),
    ...exs.map(x => ({ ...x, type: 'ex' }))
  ];

  return (
    <LinearGradient
      colors={['#1A1A2E', '#16213E', '#0F3460']}
      style={styles.container}
    >
      {/* Slide indicator component - shows user they can slide */}
      <Animated.View 
        style={[
          styles.slideIndicator, 
          { opacity: slideIndicatorOpacity }
        ]}
      >
        <View style={styles.slideIndicatorLine} />
      </Animated.View>

      {/* Use a ScrollView to ensure all content is scrollable */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Wrap all content in a single Animated.View to slide everything at once */}
        <Animated.View 
          {...panResponder.panHandlers}
          style={[
            styles.mainContent,
            {
              transform: [{ translateY: slideUpDownAnim }]
            }
          ]}
        >
          {/* Enhanced Welcome Header */}
          <Animated.View 
            style={[
              styles.welcomeHeader,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: welcomeScaleAnim }
                ]
              }
            ]}
          >
            <LinearGradient
              colors={['rgba(212, 175, 55, 0.3)', 'rgba(212, 175, 55, 0.05)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.welcomeGradient}
            >
              <View style={styles.dateTimeRow}>
                <Text style={styles.dateText}>{formattedDate}</Text>
              </View>
              <Text style={styles.greeting}>{greeting},</Text>
              <Text style={styles.nameText}>{firstName}</Text>
              <View style={styles.welcomeDivider} />
              <Text style={styles.welcomeSubtitle}>Today's Nutrition Summary</Text>
            </LinearGradient>
          </Animated.View>

          <View style={styles.statsSection}>
            <Animated.View style={{ 
              transform: [{ scale: circleAnim }],
              marginVertical: 20,
              alignItems: 'center'
            }}>
              <Progress.Circle
                size={180}
                progress={progress > 1 ? 1 : progress}
                showsText
                formatText={() => `${remaining}`}
                thickness={12}
                color="#D4AF37"
                unfilledColor="rgba(255,255,255,0.2)"
                textStyle={styles.donut}
                borderWidth={0}
              />
              <Text style={styles.subtitle}>Remaining = Goal − Food + Exercise</Text>
              <Text style={styles.goal}>Daily Goal: {dailyGoal} kcal</Text>
            </Animated.View>

            {proteinTotal + carbsTotal + fatTotal > 0 && (
              <Animated.View style={{ opacity: fadeAnim }}>
                <PieChart
                  data={pieData}
                  width={Dimensions.get('window').width - 32}
                  height={160}
                  chartConfig={{
                    backgroundColor: 'transparent',
                    backgroundGradientFrom: 'transparent',
                    backgroundGradientTo: 'transparent',
                    color: (opacity = 1) => `rgba(255,255,255,${opacity})`
                  }}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="15"
                  absolute
                />
              </Animated.View>
            )}
          </View>

          <View style={styles.inputSection}>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="e.g. 2 eggs and bacon"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={mealInput}
                onChangeText={setMealInput}
              />
              <TouchableOpacity
                onPress={addMeal}
                disabled={loading}
                style={styles.addButton}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#D4AF37', '#F5CC59']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#16213E" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Add Meal</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="e.g. 30 min running"
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={exInput}
                onChangeText={setExInput}
              />
              <TouchableOpacity
                onPress={addEx}
                disabled={loading}
                style={styles.addButton}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#D4AF37', '#F5CC59']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                  {loading ? (
                    <ActivityIndicator color="#16213E" size="small" />
                  ) : (
                    <Text style={styles.buttonText}>Add Exercise</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <Text style={styles.legendLabel}>Base</Text>
              <Text style={styles.legendValue}>{dailyGoal}</Text>
            </View>
            <View style={styles.legendItem}>
              <Text style={styles.legendLabel}>Food</Text>
              <Text style={styles.legendValue}>{consumed}</Text>
            </View>
            <View style={styles.legendItem}>
              <Text style={styles.legendLabel}>Exercise</Text>
              <Text style={styles.legendValue}>{burned}</Text>
            </View>
          </View>

          <View style={styles.listContainer}>
            <View style={styles.listHeaderRow}>
              <Text style={styles.listTitle}>Today's Entries</Text>
              <TouchableOpacity onPress={toggleExpandCollapse} style={styles.toggleButton}>
                <Text style={styles.toggleButtonText}>
                  {expandedView ? "Hide Stats ▲" : "Show Stats ▼"}
                </Text>
              </TouchableOpacity>
            </View>
            
            {entriesData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.empty}>No entries yet.</Text>
                <Text style={styles.emptySubtext}>Add your meals and exercise above.</Text>
              </View>
            ) : (
              entriesData.map((item) => {
                // Get animation value for this item, or create one if it doesn't exist
                if (!listItemAnim[item.id]) {
                  listItemAnim[item.id] = new Animated.Value(1);
                }
                
                return (
                  <Animated.View 
                    key={item.id}
                    style={[
                      styles.item,
                      { 
                        opacity: listItemAnim[item.id],
                        transform: [{ 
                          translateX: listItemAnim[item.id].interpolate({
                            inputRange: [0, 1],
                            outputRange: [50, 0]
                          })
                        }]
                      }
                    ]}
                  >
                    <LinearGradient
                      colors={item.type === 'food' 
                        ? ['rgba(212, 175, 55, 0.2)', 'rgba(212, 175, 55, 0.05)'] 
                        : ['rgba(76, 175, 80, 0.2)', 'rgba(76, 175, 80, 0.05)']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.itemGradient}
                    >
                      <View style={styles.itemContent}>
                        <View style={styles.itemLeft}>
                          <Text style={styles.itemIcon}>
                            {item.type === 'food' ? '🍽️' : '🔥'}
                          </Text>
                          <Text style={styles.itemText}>{item.name}</Text>
                        </View>
                        <Text style={styles.itemCalories}>{item.calories} kcal</Text>
                      </View>
                    </LinearGradient>
                  </Animated.View>
                );
              })
            )}
          </View>
          
          {/* Add extra padding at the bottom to ensure content is accessible */}
          <View style={styles.bottomPadding} />
        </Animated.View>
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
  mainContent: {
    width: '100%',
  },
  slideIndicator: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 8,
    position: 'absolute',
    top: 10,
    zIndex: 10,
  },
  slideIndicatorLine: {
    width: 40,
    height: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 5,
  },
  statsSection: {
    alignItems: 'center',
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
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  dateText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
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
    backgroundColor: 'rgba(212, 175, 55, 0.5)',
    marginVertical: 10,
    width: '60%',
  },
  welcomeSubtitle: {
    color: '#D4AF37',
    fontSize: 16,
    marginTop: 5,
    fontWeight: '500',
  },
  donut: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginTop: 10,
    fontSize: 13,
  },
  goal: {
    color: '#D4AF37',
    marginTop: 8,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  inputSection: {
    width: '100%',
    marginVertical: 10,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  input: {
    flex: 1,
    borderColor: 'rgba(212, 175, 55, 0.5)',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    paddingLeft: 16,
    color: '#fff',
    marginRight: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    fontSize: 16,
  },
  addButton: {
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
  },
  buttonText: {
    color: '#16213E',
    fontWeight: '700',
    fontSize: 15,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    padding: 12,
    marginVertical: 10,
  },
  legendItem: {
    alignItems: 'center',
  },
  legendLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginBottom: 4,
  },
  legendValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listContainer: {
    width: '100%',
    marginBottom: 20,
  },
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    marginTop: 5,
  },
  listTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  toggleButton: {
    padding: 5,
  },
  toggleButtonText: {
    color: '#D4AF37',
    fontSize: 14,
    fontWeight: '500',
  },
  item: {
    marginVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  itemGradient: {
    borderRadius: 10,
  },
  itemContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 14,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemIcon: {
    marginRight: 10,
    fontSize: 16,
  },
  itemText: {
    color: '#fff',
    fontSize: 16,
  },
  itemCalories: {
    color: '#D4AF37',
    fontWeight: '600',
    fontSize: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  empty: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontWeight: '500',
  },
  emptySubtext: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 14,
    marginTop: 8,
  },
  bottomPadding: {
    height: 50, // Extra space at the bottom
  }
});