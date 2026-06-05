import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import GamesScreen from '../screens/GamesScreen';
import GameCreateScreen from '../screens/GameCreateScreen';

export type DrawerParamList = {
  Games: undefined;
  GameCreate: undefined;
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
      <Drawer.Screen
        name="GameCreate"
        component={GameCreateScreen}
        options={{
          title: 'Novo Jogo',
        }}
      />
    </Drawer.Navigator>  
  );
};

export default DrawerNavigator;