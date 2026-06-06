import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, LayoutAnimation, Platform, UIManager } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import api from '../src/services/api';

// Habilita as animações de layout no Android (no iOS já vem ativado por padrão)
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function RegisterScreen() {
  // Estado para controlar qual aba está ativa
  const [accountType, setAccountType] = useState<'user' | 'admin'>('user');

  // Estados dos campos de texto
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const navigation = useNavigation();

  // Função para trocar de aba com animação suave
  const handleTabChange = (type: 'user' | 'admin') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setAccountType(type);
    
    // Opcional: Limpar os campos ao trocar de aba
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
  };

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      Alert.alert("Atenção", "Preencha todos os campos!");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Atenção", "As senhas não coincidem!");
      return;
    }

    // Define para qual URL os dados vão, dependendo da aba escolhida
    const endpoint = accountType === 'user' ? '/usuarios/' : '/administradores/';

    try {
      await api.post(endpoint, {
        username: username,
        email: email,
        password: password
      });

      const successMessage = accountType === 'user' 
        ? "Conta de Usuário criada com sucesso!" 
        : "Conta de Administrador criada com sucesso!";

      Alert.alert("Sucesso", `${successMessage} Faça login para continuar.`);
      
      setUsername(""); setEmail(""); setPassword(""); setConfirmPassword("");
      //navigation.navigate("Login" as never);

    } catch (error: any) {
      console.error("Erro no cadastro:", error);
      Alert.alert("Erro", "Não foi possível criar a conta. Verifique os dados.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Criar Nova Conta</Text>

      {/* --- SELETOR DE ABAS (TABS) --- */}
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

      {/* --- FORMULÁRIO COMPARTILHADO --- */}
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>
          {accountType === 'user' ? 'Dados do Usuário' : 'Dados do Administrador'}
        </Text>

        <Text style={styles.label}>Nome de Usuário</Text>
        <TextInput style={styles.input} value={username} onChangeText={setUsername} autoCapitalize="none" />

        <Text style={styles.label}>E-mail</Text>
        <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />

        <Text style={styles.label}>Senha</Text>
        <TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry={true} />

        <Text style={styles.label}>Confirmar Senha</Text>
        <TextInput style={styles.input} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry={true} />

        <TouchableOpacity 
          style={[styles.button, accountType === 'admin' && styles.buttonAdmin]} 
          onPress={handleRegister}
        >
          <Text style={styles.buttonText}>
            {accountType === 'user' ? 'Cadastrar Usuário' : 'Cadastrar Administrador'}
          </Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate("Login" as never)}>
        <Text style={styles.linkText}>Já tem uma conta? Faça Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 20, backgroundColor: '#f4f7f6' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#333' },
  
  // Estilos das Abas
  tabContainer: { flexDirection: 'row', backgroundColor: '#e0e0e0', borderRadius: 10, padding: 4, marginBottom: 25 },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderRadius: 8 },
  tabButtonActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  tabText: { fontSize: 16, fontWeight: '600', color: '#777' },
  tabTextActive: { color: '#007BFF' },

  // Estilos do Formulário
  formContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 5, elevation: 3 },
  formTitle: { fontSize: 18, fontWeight: 'bold', color: '#555', marginBottom: 15, textAlign: 'center' },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 5, color: '#444' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 15, backgroundColor: '#fafafa' },
  
  // Botão Principal (Muda de cor se for Admin para dar feedback visual)
  button: { backgroundColor: '#007BFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonAdmin: { backgroundColor: '#343a40' }, 
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  
  linkButton: { marginTop: 25, alignItems: 'center' },
  linkText: { color: '#007BFF', fontSize: 16, fontWeight: 'bold' }
});