import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import GamesScreen from '../screens/GamesScreen';

export type DrawerParamList = {
  Games: undefined;
};

const Drawer = createDrawerNavigator<DrawerParamList>();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator
      initialRouteName="Games"
      screenOptions={{
        headerStyle: { backgroundColor: '#4B7BE5' },
        headerTintColor: '#fff',
      }}
    >
      <Drawer.Screen
        name="Games"
        component={GamesScreen}
        options={{
          title: 'Biblioteca de Jogos',
        }}
      />
    </Drawer.Navigator>  
  );
};

export default DrawerNavigator;