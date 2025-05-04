import React, { useState, useContext, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  Keyboard,
  Dimensions
} from 'react-native';
import * as Progress from 'react-native-progress';
import { PieChart } from 'react-native-chart-kit';
import { AuthContext } from '../context/AuthContext';
import { NIX_ID, NIX_KEY } from '@env';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const calcBMR = (w, h, a) => 10 * w + 6.25 * h - 5 * a + 5;
const ACTIVITY = 1.55;

export default function CalorieTrackerScreen() {
  const { user, userData } = useContext(AuthContext);
  const userId = user?.uid;
  const [dailyGoal, setDailyGoal] = useState(0);

  const [mealInput, setMealInput] = useState('');
  const [meals, setMeals]         = useState([]); // { name, calories, protein, carbs, fat }

  const [exInput, setExInput]     = useState('');
  const [exs, setExs]             = useState([]); // { name, calories }

  const [loading, setLoading]     = useState(false);

  const today = new Date().toISOString().split('T')[0];

  // Load userData & today's log from Firestore
  useEffect(() => {
    if (!userData) return;

    // 1) compute daily goal
    const w  = Number(userData.weight),
          h  = Number(userData.height),
          a  = Number(userData.age),
          tw = Number(userData.targetWeight);
    let tdee = calcBMR(w, h, a) * ACTIVITY;
    tdee = tw > w ? tdee + 500 : tdee - 500;
    setDailyGoal(Math.round(tdee));

    // 2) load today's meals/exercises
    const loadToday = async () => {
      if (!userId) return;
      const ref = doc(db, 'users', userId, 'calorieLogs', today);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        setMeals(data.meals || []);
        setExs(data.exs   || []);
      }
    };
    loadToday();
  }, [userData]);

  // helper to save current log
  const updateFirestore = async (newMeals, newExs) => {
    if (!userId) return;
    const ref = doc(db, 'users', userId, 'calorieLogs', today);
    await setDoc(ref, {
      meals: newMeals,
      exs:   newExs
    });
  };

  // shared fetch for Nutritionix
  const nixFetch = async (url, body) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-app-id':      NIX_ID,
        'x-app-key':     NIX_KEY
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
      if (!data.foods?.length) {
        Alert.alert('Not Found', 'We are sorry, this meal is not in our database.');
        setLoading(false);
        return;
      }

      const calories = data.foods.reduce((s, f) => s + (f.nf_calories || 0), 0);
      const protein  = data.foods.reduce((s, f) => s + (f.nf_protein || 0), 0);
      const carbs    = data.foods.reduce((s, f) => s + (f.nf_total_carbohydrate || 0), 0);
      const fat      = data.foods.reduce((s, f) => s + (f.nf_total_fat || 0), 0);

      const newMeal = {
        name: mealInput,
        calories: Math.round(calories),
        protein:  Math.round(protein),
        carbs:    Math.round(carbs),
        fat:      Math.round(fat)
      };

      const updatedMeals = [newMeal, ...meals];
      setMeals(updatedMeals);
      await updateFirestore(updatedMeals, exs);

      setMealInput('');
      Keyboard.dismiss();
    } catch (e) {
      Alert.alert('Error', e.message);
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
      if (!data.exercises?.length) {
        Alert.alert('Not Found', 'We are sorry, this exercise is not in our database.');
        setLoading(false);
        return;
      }

      const calories = data.exercises.reduce((s, x) => s + (x.nf_calories || 0), 0);
      const newEx    = { name: exInput, calories: Math.round(calories) };

      const updatedExs = [newEx, ...exs];
      setExs(updatedExs);
      await updateFirestore(meals, updatedExs);

      setExInput('');
      Keyboard.dismiss();
    } catch (e) {
      Alert.alert('Error', e.message);
    }

    setLoading(false);
  };

  // recalc totals
  const consumed = meals.reduce((s, m) => s + m.calories, 0);
  const burned   = exs.reduce((s, x) => s + x.calories, 0);
  const remain   = Math.max(dailyGoal - consumed + burned, 0);
  const progress = dailyGoal > 0 ? consumed / dailyGoal : 0;

  const proteinTotal = meals.reduce((s, m) => s + m.protein, 0);
  const carbsTotal   = meals.reduce((s, m) => s + m.carbs, 0);
  const fatTotal     = meals.reduce((s, m) => s + m.fat, 0);

  const pieData = [
    { name: 'Protein', population: proteinTotal, color: '#D4AF37', legendFontColor: '#fff', legendFontSize: 14 },
    { name: 'Carbs',   population: carbsTotal,   color: '#4CAF50', legendFontColor: '#fff', legendFontSize: 14 },
    { name: 'Fat',     population: fatTotal,     color: '#F44336', legendFontColor: '#fff', legendFontSize: 14 },
  ];

  return (
    <View style={styles.cont}>
      <Text style={styles.title}>Calorie Tracker</Text>
      <Text style={styles.goal}>Goal: {dailyGoal} kcal</Text>

      <Progress.Circle
        size={160}
        progress={progress > 1 ? 1 : progress}
        showsText
        formatText={() => `${remain}`}
        thickness={10}
        color="#D4AF37"
        unfilledColor="#333"
        textStyle={styles.donut}
        borderWidth={0}
      />
      <Text style={styles.subtitle}>Remaining = Goal − Food + Exercise</Text>

      {proteinTotal + carbsTotal + fatTotal > 0 && (
        <PieChart
          data={pieData}
          width={Dimensions.get('window').width - 32}
          height={150}
          chartConfig={{
            backgroundColor: '#141414',
            backgroundGradientFrom: '#141414',
            backgroundGradientTo: '#141414',
            color: (opacity = 1) => `rgba(255,255,255,${opacity})`
          }}
          accessor="population"
          backgroundColor="transparent"
          paddingLeft="15"
          absolute
        />
      )}

      {/* Meal input */}
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="e.g. 2 eggs and bacon"
          placeholderTextColor="#888"
          value={mealInput}
          onChangeText={setMealInput}
        />
        <Button
          title={loading ? '...' : 'Add Meal'}
          onPress={addMeal}
          color="#D4AF37"
          disabled={loading}
        />
      </View>

      {/* Exercise input */}
      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="e.g. 30 min running"
          placeholderTextColor="#888"
          value={exInput}
          onChangeText={setExInput}
        />
        <Button
          title={loading ? '...' : 'Add Ex'}
          onPress={addEx}
          color="#D4AF37"
          disabled={loading}
        />
      </View>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendText}>Base: {dailyGoal}</Text>
        <Text style={styles.legendText}>Food: {consumed}</Text>
        <Text style={styles.legendText}>Ex: {burned}</Text>
      </View>

      {/* Log list */}
      <FlatList
        data={[
          ...meals.map(m => ({ ...m, type: 'food' })),
          ...exs.map(x => ({ ...x, type: 'ex' }))
        ]}
        keyExtractor={(_, i) => String(i)}
        style={{ width: '100%' }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Text style={styles.itemText}>
              {item.type === 'food' ? '🍽️' : '🔥'} {item.name}
            </Text>
            <Text style={styles.itemText}>{item.calories} kcal</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No entries yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  cont: { flex: 1, backgroundColor: '#141414', padding: 16, alignItems: 'center' },
  title: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  goal: { color: '#ccc', marginTop: 4 },
  donut: { fontSize: 28, color: '#fff', fontWeight: 'bold' },
  subtitle: { color: '#888', marginBottom: 12 },
  row: { flexDirection: 'row', width: '100%', marginVertical: 6 },
  input: { flex: 1, borderColor: '#D4AF37', borderWidth: 1, borderRadius: 6, padding: 8, color: '#fff', marginRight: 8 },
  legend: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', paddingHorizontal: 16, marginVertical: 12 },
  legendText: { color: '#fff' },
  item: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomColor: '#333', borderBottomWidth: 1 },
  itemText: { color: '#fff', flex: 1 },
  empty: { color: '#888', marginTop: 20 }
});
