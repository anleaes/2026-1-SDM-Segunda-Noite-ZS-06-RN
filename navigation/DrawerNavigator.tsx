import { createDrawerNavigator } from '@react-navigation/drawer';
import React from 'react';
import GamesScreen from '../screens/GamesScreen';
import GameCreateScreen from '../screens/GameCreateScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type DrawerParamList = {
  Games: undefined;
  GameCreate: undefined;
  Login: undefined;
  Register: undefined;
  Profile: undefined;
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
      <Drawer.Screen
        name="Login"
        component={LoginScreen}
        options={{ title: 'Fazer Login' }}
      />
      <Drawer.Screen 
        name="Register" 
        component={RegisterScreen} 
        options={{ title: 'Criar Conta' }} 
      />
      <Drawer.Screen 
      name="Profile" 
      component={ProfileScreen} 
      options={{ title: 'Meu Perfil' }} 
    />
    </Drawer.Navigator>  
  );
};

export default DrawerNavigator;