

import React, { useContext, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Alert
} from 'react-native';
import {
  DrawerContentScrollView,
  DrawerItemList
} from '@react-navigation/drawer';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase/config';
import { Feather } from '@expo/vector-icons';
import { AuthContext } from '../context/AuthContext';
import { doc, getDoc } from 'firebase/firestore';

export default function CustomDrawerContent(props) {
  // Access the user data from AuthContext
  const { user, userData } = useContext(AuthContext);
  const [displayName, setDisplayName] = useState('User');
  
  // Fetch user data directly to ensure we have the most current info
  useEffect(() => {
    const fetchUserData = async () => {
      if (user) {
        try {
          const docRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            // Try different possible field names for the user's name
            const data = docSnap.data();
            const name = data.displayName || data.fullName || data.name || data.username || data.firstName;
            
            if (name) {
              setDisplayName(name);
            } else if (user.displayName) {
              setDisplayName(user.displayName);
            }
          } else if (user.displayName) {
            setDisplayName(user.displayName);
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      }
    };
    
    fetchUserData();
  }, [user]);
  
  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Logout',
          onPress: () => {
            signOut(auth)
              .catch(err => Alert.alert('Logout Error', err.message));
          },
          style: 'destructive'
        }
      ]
    );
  };

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={styles.scrollContainer}
    >
      <View style={styles.headerContainer}>
        <View style={styles.profileImageContainer}>
          <Text style={styles.profileInitial}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.welcomeText}>
          Welcome, {displayName}
        </Text>
        <Text style={styles.emailText}>
          {user?.email || ''}
        </Text>
      </View>
      
      <View style={styles.divider} />
      
      <DrawerItemList 
        {...props} 
        itemStyle={styles.drawerItem}
        labelStyle={styles.drawerItemLabel}
      />
      
      <View style={styles.divider} />

      <View style={styles.logoutWrapper}>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
        >
          <Feather name="log-out" size={20} color="#141414" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>
    </DrawerContentScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flex: 1,
    paddingTop: 0,
  },
  headerContainer: {
    padding: 20,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    paddingTop: 30,
    paddingBottom: 20,
  },
  profileImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    marginBottom: 10,
    backgroundColor: '#D4AF37',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F5F5F5',
  },
  profileInitial: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#141414',
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#141414',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 14,
    color: '#666666',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 10,
    marginHorizontal: 15,
  },
  drawerItem: {
    borderRadius: 8,
    marginHorizontal: 10,
    marginVertical: 2,
  },
  drawerItemLabel: {
    fontWeight: '500',
    fontSize: 16,
  },
  logoutWrapper: {
    padding: 15,
    paddingBottom: 25,
    marginTop: 'auto',
  },
  logoutButton: {
    backgroundColor: '#D4AF37',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  logoutText: {
    color: '#141414',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});