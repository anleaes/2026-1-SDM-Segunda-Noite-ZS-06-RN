import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../src/services/api';

export default function LoginScreen() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigation = useNavigation();

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Atenção", "Preencha usuário e senha!");
      return;
    }

    try {
      // 1. Bate na porta do Django enviando as credenciais
      const response = await api.post('/api/token/', {
        username: username,
        password: password
      });

      // 2. Se deu certo, pega o Token que o Django devolveu e guarda no cofre do celular
      await AsyncStorage.setItem('userToken', response.data.token);
      
      Alert.alert("Sucesso", "Bem-vindo!");
      
      // 3. Redireciona para a lista de jogos
      navigation.navigate("Games" as never);

    } catch (error: any) {
      console.error("Erro no login:", error);
      Alert.alert("Erro", "Usuário ou senha incorretos.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Acessar Conta</Text>

      <TextInput
        style={styles.input}
        placeholder="Usuário"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none" // Evita que o celular coloque a primeira letra maiúscula sozinho
      />

      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={true} // Esconde a senha com asteriscos
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 30, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 15, fontSize: 16, marginBottom: 15, backgroundColor: '#f9f9f9' },
  button: { backgroundColor: '#4B7BE5', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});