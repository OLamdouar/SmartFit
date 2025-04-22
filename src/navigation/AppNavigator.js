import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { ActivityIndicator, View } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import CalorieTrackerScreen from '../screens/CalorieTrackerScreen';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WorkoutPlanScreen from '../screens/WorkoutPlanScreen';
import MealPlanScreen from '../screens/MealPlanScreen';
import WeeklyPlanDashboard from '../screens/WeeklyPlanDashboard';
import WeightTrackingScreen from '../screens/WeightTrackingScreen';
import WorkoutPlanAIScreen from '../screens/WorkoutPlanAIScreen';
import MealPlanAIScreen from '../screens/MealPlanAIScreen';
import CustomDrawerContent from './CustomDrawerContent';

import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#141414' },
        headerTintColor: '#D4AF37'
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ title: 'Login' }} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ title: 'Register' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ flex:1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {user ? (
        <Drawer.Navigator 
          drawerContent={(props) => <CustomDrawerContent {...props} />}
          screenOptions={{
            headerStyle: { backgroundColor: '#141414' },
            headerTintColor: '#D4AF37',
            drawerActiveTintColor: '#D4AF37',
            drawerInactiveTintColor: '#fff',
            drawerStyle: { backgroundColor: '#141414' },
          }}
        >
          <Drawer.Screen name="Home" component={HomeScreen} options={{ title: 'Home' }} />
          <Drawer.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
          <Drawer.Screen name="WorkoutPlan" component={WorkoutPlanScreen} options={{ title: 'Workout Plan' }} />
          <Drawer.Screen name="MealPlan" component={MealPlanScreen} options={{ title: 'Meal Plan' }} />
          <Drawer.Screen name="WeeklyPlanDashboard" component={WeeklyPlanDashboard} options={{ title: 'Weekly Plan Dashboard' }} />
          <Drawer.Screen name="WeightTracking" component={WeightTrackingScreen} options={{ title: 'Weight Tracking' }} />
          <Drawer.Screen name="WorkoutPlanAI" component={WorkoutPlanAIScreen} options={{ title: 'AI Workout Plan' }} />
          <Drawer.Screen name="MealPlanSpoonacular" component={MealPlanAIScreen} options={{ title: 'Spoonacular Meal Plan' }} />
          <Drawer.Screen name="CalorieTracker" component={CalorieTrackerScreen} options={{ title: 'Calorie Tracker' }} />
        </Drawer.Navigator>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
