import React, { useState, useContext, useEffect } from 'react';
import {
  View, Text, TextInput, Button, FlatList,
  StyleSheet, Alert, Keyboard
} from 'react-native';
import * as Progress from 'react-native-progress';
import { AuthContext } from '../context/AuthContext';
import 'dotenv/CalorieTrackerScreen';

NIX_ID: process.env.NIX_ID
NIX_KEY: process.env.NIX_KEY

// Mifflin–St Jeor
const calcBMR = (w,h,a) => 10*w + 6.25*h - 5*a + 5;
const ACTIVITY = 1.55;

export default function CalorieTrackerScreen() {
  const { userData } = useContext(AuthContext);
  const [dailyGoal, setDailyGoal] = useState(0);

  const [mealInput, setMealInput] = useState('');
  const [meals, setMeals]         = useState([]);

  const [exInput, setExInput]     = useState('');
  const [exs, setExs]             = useState([]);

  const [loading, setLoading]     = useState(false);

  // Compute goal when userData loads
  useEffect(() => {
    if (!userData) return;
    const w = Number(userData.weight),
          h = Number(userData.height),
          a = Number(userData.age),
          tw = Number(userData.targetWeight);
    let tdee = calcBMR(w,h,a) * ACTIVITY;
    // adjust ±500 based on direction
    tdee = tw > w ? tdee + 500 : tdee - 500;
    setDailyGoal(Math.round(tdee));
  }, [userData]);

  const nixFetch = async (url, body) => {
    const res = await fetch(url, {
      method:'POST',
      headers:{
        'Content-Type':'application/json',
        'x-app-id':NIX_ID,
        'x-app-key':NIX_KEY
      },
      body:JSON.stringify(body)
    });
    if(!res.ok) throw new Error(res.statusText);
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
      const cal = data.foods.reduce((s,f)=>s+(f.nf_calories||0),0);
      setMeals(m=>[{name:mealInput, calories:Math.round(cal)},...m]);
      setMealInput('');
      Keyboard.dismiss();
    } catch(e){ Alert.alert('Error',e.message) }
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
      const cal = data.exercises.reduce((s,x)=>s+(x.nf_calories||0),0);
      setExs(e=>[{name:exInput, calories:Math.round(cal)},...e]);
      setExInput('');
      Keyboard.dismiss();
    } catch(e){ Alert.alert('Error',e.message) }
    setLoading(false);
  };

  const consumed = meals.reduce((s,m)=>s+m.calories,0),
        burned   = exs.reduce((s,x)=>s+x.calories,0),
        remain   = Math.max(dailyGoal - consumed + burned,0),
        prog     = dailyGoal>0 ? consumed/dailyGoal : 0;

  return (
    <View style={styles.cont}>
      <Text style={styles.title}>Calorie Tracker</Text>
      <Text style={styles.goal}>Goal: {dailyGoal} kcal</Text>

      <Progress.Circle
        size={160}
        progress={prog>1?1:prog}
        showsText
        formatText={()=>`${remain}`}
        thickness={10}
        color="#D4AF37"
        unfilledColor="#333"
        textStyle={styles.donut}
        borderWidth={0}
      />
      <Text style={styles.subtitle}>Remaining = Goal − Food + Exercise</Text>

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="e.g. 2 eggs"
          placeholderTextColor="#888"
          value={mealInput}
          onChangeText={setMealInput}
        />
        <Button title={loading?'...':'Add'} onPress={addMeal} color="#D4AF37" disabled={loading}/>
      </View>

      <View style={styles.row}>
        <TextInput
          style={styles.input}
          placeholder="e.g. 30 min run"
          placeholderTextColor="#888"
          value={exInput}
          onChangeText={setExInput}
        />
        <Button title={loading?'...':'Add'} onPress={addEx} color="#D4AF37" disabled={loading}/>
      </View>

      <View style={styles.legend}>
        <Text style={styles.legendText}>Base: {dailyGoal}</Text>
        <Text style={styles.legendText}>Food: {consumed}</Text>
        <Text style={styles.legendText}>Ex: {burned}</Text>
      </View>

      <FlatList
        data={[...meals.map(m=>({...m,type:'food'})),...exs.map(x=>({...x,type:'ex'}))]}
        keyExtractor={(_,i)=>String(i)}
        style={{width:'100%'}}
        renderItem={({item})=>(
          <View style={styles.item}>
            <Text style={styles.itemText}>
              {item.type==='food'?'🍽️':'🔥'} {item.name}
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
  cont:{ flex:1, backgroundColor:'#141414', padding:16, alignItems:'center' },
  title:{ color:'#fff', fontSize:24, fontWeight:'bold' },
  goal:{ color:'#ccc', marginTop:4 },
  donut:{ fontSize:28, color:'#fff', fontWeight:'bold' },
  subtitle:{ color:'#888', marginBottom:12 },
  row:{ flexDirection:'row', width:'100%', marginVertical:6 },
  input:{ flex:1, borderColor:'#D4AF37', borderWidth:1, borderRadius:6, padding:8, color:'#fff', marginRight:8 },
  legend:{ flexDirection:'row', justifyContent:'space-between', width:'100%', paddingHorizontal:16, marginVertical:12 },
  legendText:{ color:'#fff' },
  item:{ flexDirection:'row', justifyContent:'space-between', paddingVertical:6, borderBottomColor:'#333', borderBottomWidth:1 },
  itemText:{ color:'#fff', flex:1 },
  empty:{ color:'#888', marginTop:20 }
});
