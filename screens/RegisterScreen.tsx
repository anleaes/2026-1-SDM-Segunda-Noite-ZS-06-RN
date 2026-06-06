import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../src/services/api';

// Habilita as animações de layout no Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function RegisterScreen() {
  const [accountType, setAccountType] = useState<'user' | 'admin'>('user');

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const navigation = useNavigation();

  const handleTabChange = (type: 'user' | 'admin') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAccountType(type);
    
    setFirstName(""); setLastName(""); setUsername(""); 
    setEmail(""); setPassword(""); setConfirmPassword("");
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !username || !email || !password || !confirmPassword) {
      Alert.alert("Atenção", "Preencha todos os campos!");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Atenção", "As senhas não coincidem!");
      return;
    }

    const endpoint = accountType === 'user' ? '/usuarios/' : '/administradores/';

    try {
      await api.post(endpoint, {
        first_name: firstName,
        last_name: lastName,
        username: username,
        email: email,
        password: password
      });

      const successMessage = accountType === 'user' 
        ? "Conta de Usuário criada com sucesso!" 
        : "Conta de Administrador criada com sucesso!";

      Alert.alert("Sucesso", `${successMessage} Faça login para continuar.`);
      
      setFirstName(""); setLastName(""); setUsername(""); 
      setEmail(""); setPassword(""); setConfirmPassword("");
      
      navigation.navigate("Login" as never);

    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      Alert.alert("Erro", "Não foi possível criar a conta. Verifique se o usuário já existe.");
    }
  };

  // Variável para saber se as senhas estão diferentes (e se o usuário já começou a digitar a confirmação)
  const senhasDiferentes = confirmPassword.length > 0 && password !== confirmPassword;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Criar Nova Conta</Text>

      <TouchableOpacity style={styles.linkButtonTop} onPress={() => navigation.navigate("Login" as never)}>
        <Text style={styles.linkTextTop}>Já tem uma conta? Faça Login</Text>
      </TouchableOpacity>

      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tabButton, accountType === 'user' && styles.tabButtonActive]} 
          onPress={() => handleTabChange('user')}
        >
          <Text style={[styles.tabText, accountType === 'user' && styles.tabTextActive]}>Usuário</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.tabButton, accountType === 'admin' && styles.tabButtonActive]} 
          onPress={() => handleTabChange('admin')}
        >
          <Text style={[styles.tabText, accountType === 'admin' && styles.tabTextActive]}>Administrador</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>
          {accountType === 'user' ? 'Dados do Usuário' : 'Dados do Administrador'}
        </Text>

        <Text style={styles.label}>Nome</Text>
        <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />

        <Text style={styles.label}>Sobrenome</Text>
        <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />

        <Text style={styles.label}>Nome de Usuário (Login)</Text>
        <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" />

        <Text style={styles.label}>E-mail</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        <Text style={styles.label}>Senha</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry={true} />

        <Text style={styles.label}>Confirmar Senha</Text>
        <TextInput 
          style={[styles.input, senhasDiferentes && styles.inputError]} 
          value={confirmPassword} 
          onChangeText={setConfirmPassword} 
          secureTextEntry={true} 
        />
        {/* Aviso visual em vermelho */}
        {senhasDiferentes && (
          <Text style={styles.errorText}>As senhas não coincidem!</Text>
        )}

        <TouchableOpacity 
          style={[styles.button, accountType === 'admin' && styles.buttonAdmin]} 
          onPress={handleRegister}
        >
          <Text style={styles.buttonText}>
            {accountType === 'user' ? 'Cadastrar Usuário' : 'Cadastrar Administrador'}
          </Text>
        </TouchableOpacity>
      </View>
      
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f4f7f6', paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginTop: 20, marginBottom: 5, color: '#333' },
  
  linkButtonTop: { alignItems: 'center', marginBottom: 25, paddingVertical: 5 },
  linkTextTop: { color: '#007BFF', fontSize: 16, fontWeight: 'bold', textDecorationLine: 'underline' },
  
  tabContainer: { flexDirection: 'row', backgroundColor: '#e0e0e0', borderRadius: 10, padding: 4, marginBottom: 25 },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  tabButtonActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  tabText: { fontSize: 16, fontWeight: '600', color: '#777' },
  tabTextActive: { color: '#007BFF' },

  formContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#555', marginBottom: 15, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 5, color: '#444' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 15, backgroundColor: '#fafafa' },
  
  // Estilos de Erro
  inputError: { borderColor: '#dc3545', borderWidth: 1.5, marginBottom: 5 },
  errorText: { color: '#dc3545', fontSize: 12, fontWeight: 'bold', marginBottom: 15, marginLeft: 5 },
  
  button: { backgroundColor: '#007BFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonAdmin: { backgroundColor: '#343a40' }, 
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});