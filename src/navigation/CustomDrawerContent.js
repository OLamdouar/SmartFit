

import React, { useContext } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { AuthContext } from '../context/AuthContext';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase/config';

const CustomDrawerContent = (props) => {
  const { userData } = useContext(AuthContext);

  // Extract first name if available
  const firstName = userData?.fullName ? userData.fullName.split(' ')[0] : 'User';

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        // Handle any additional navigation if necessary
      })
      .catch(err => alert(err.message));
  };

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Hello, {firstName}!</Text>
      </View>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Logout"
        labelStyle={styles.drawerLabel}
        onPress={handleLogout}
      />
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#141414',
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#141414',
    borderBottomWidth: 1,
    borderBottomColor: '#D4AF37',
    marginBottom: 10,
  },
  headerText: {
    color: '#D4AF37',
    fontSize: 20,
    fontWeight: 'bold',
  },
  drawerLabel: {
    color: '#fff',
  },
});

export default CustomDrawerContent;
