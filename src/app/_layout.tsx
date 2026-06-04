import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack>
      <Stack.Screen 
        name="index" 
        options={{ 
          title: 'Biblioteca de Jogos',
          headerTitleAlign: 'center'
        }} 
      />
    </Stack>
  );
}
