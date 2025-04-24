
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, Text, StatusBar } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';

import { AuthContext } from '../context/AuthContext';
import CustomDrawerContent from './CustomDrawerContent';

import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import WorkoutPlanAiScreen from '../screens/WorkoutPlanAiScreen';
import MealPlanAIScreen from '../screens/MealPlanAIScreen';
import CalorieTrackerScreen from '../screens/CalorieTrackerScreen';
import WeeklyPlanDashboard from '../screens/WeeklyPlanDashboard';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

function AuthenticatedDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerTintColor: '#fff',
        headerStyle: { 
          backgroundColor: '#141414',
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },
        drawerActiveTintColor: '#D4AF37',
        drawerInactiveTintColor: '#fff',
        drawerStyle: { 
          backgroundColor: '#141414',
          width: 280,
        },
        drawerLabelStyle: {
          fontSize: 16,
          fontWeight: '500',
          marginLeft: -15,
        },
        drawerItemStyle: {
          borderRadius: 0,
          marginHorizontal: 0,
          paddingVertical: 5,
        }
      }}
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        options={{ 
          title: '  Home',
          drawerIcon: ({ color }) => (
            <FontAwesome5 name="home" size={22} color={color} />
          )
        }}
      />
      <Drawer.Screen
        name="WorkoutPlanAI"
        component={WorkoutPlanAiScreen}
        options={{ 
          title: '  Workout Plan',
          drawerIcon: ({ color }) => (
            <FontAwesome5 name="heartbeat" size={22} color={color} />
          )
        }}
      />
      <Drawer.Screen
        name="MealPlan"
        component={MealPlanAIScreen}
        options={{ 
          title: '  Meal Plan',
          drawerIcon: ({ color }) => (
            <FontAwesome5 name="utensils" size={22} color={color} />
          )
        }}
      />
      <Drawer.Screen
        name="WeeklyPlanDashboard"
        component={WeeklyPlanDashboard}
        options={{ 
          title: '  Weekly Plan',
          drawerIcon: ({ color }) => (
            <FontAwesome5 name="calendar-week" size={22} color={color} />
          )
        }}
      />
      <Drawer.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ 
          title: '  Profile',
          drawerIcon: ({ color }) => (
            <FontAwesome5 name="user" size={22} color={color} />
          )
        }}
      />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#141414' 
      }}>
        <StatusBar barStyle="light-content" backgroundColor="#141414" />
        <ActivityIndicator size="large" color="#D4AF37" />
        <Text style={{ 
          color: '#fff', 
          marginTop: 15, 
          fontSize: 16 
        }}>
          Loading...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar barStyle="light-content" backgroundColor="#141414" />
      {user ? (
        <AuthenticatedDrawer />
      ) : (
        <Stack.Navigator 
          screenOptions={{ 
            headerShown: false,
            contentStyle: { backgroundColor: '#141414' }
          }}
        >
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
}