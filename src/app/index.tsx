import React from 'react';
import { NavigationContainer } from '@react-navigation/native';

// Mantenha o caminho exato que funcionou para você no passo anterior.
// Se a pasta navigation estiver na raiz, use '../../navigation/DrawerNavigator'
// Se estiver dentro de src, use '../navigation/DrawerNavigator'
import DrawerNavigator from '../../navigation/DrawerNavigator';

export default function App() {
  return (
    // O independent={true} impede que o React Navigation dê erro por estar rodando dentro do Expo Router
    <NavigationContainer>
      <DrawerNavigator />
    </NavigationContainer>
  );
}