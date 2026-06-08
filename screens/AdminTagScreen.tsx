import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, Switch } from 'react-native';
import api from '../src/services/api';

export default function AdminTagScreen() {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleCreateTag = async () => {
    if (!name.trim() || !category.trim()) {
      Alert.alert('Atenção', 'Por favor, preencha o nome e a categoria da tag.');
      return;
    }

    setLoading(true);

    try {
      // Lembra que renomeamos a rota base para 'categoria' no urls.py? É aqui que usamos ela!
      await api.post('/tag/categoria/', {
        name: name,
        category: category,
        is_active: isActive
      });

      Alert.alert('Sucesso!', `A tag "${name}" foi criada e já está disponível para os usuários.`);
      
      // Limpa o formulário após o sucesso
      setName('');
      setCategory('');
      setIsActive(true);

    } catch (error: any) {
      console.error(error);
      // Se o backend barrar (Erro 403 Forbidden), mostramos o aviso do "segurança"
      if (error.response && error.response.status === 403) {
        Alert.alert('Acesso Negado', 'Apenas administradores do sistema podem criar novas Tags.');
      } else {
        Alert.alert('Erro', 'Não foi possível criar a tag. Verifique sua conexão.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Painel do Administrador</Text>
        <Text style={styles.subtitle}>Criação de Tags Base</Text>
      </View>

      <View style={styles.formCard}>
        <Text style={styles.label}>Nome da Tag</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Mundo Aberto, RPG, Difícil..."
          placeholderTextColor="#8f98a0"
          value={name}
          onChangeText={setName}
          maxLength={50} // Respeitando o max_length do seu models.py
        />

        <Text style={styles.label}>Categoria</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Gênero, Mecânica, Dificuldade..."
          placeholderTextColor="#8f98a0"
          value={category}
          onChangeText={setCategory}
          maxLength={50} // Respeitando o max_length do seu models.py
        />

        <View style={styles.switchRow}>
          <Text style={styles.switchLabel}>Tag Ativa (Visível para o público?)</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: '#767577', true: '#66c0f4' }}
            thumbColor={isActive ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={handleCreateTag}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Criando...' : 'Criar Nova Tag'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#1b2838', // Fundo padrão da Steam que você está usando
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#66c0f4',
    marginTop: 5,
  },
  formCard: {
    backgroundColor: '#171a21',
    padding: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2a475e',
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#c7d5e0',
    marginBottom: 8,
    marginTop: 15,
  },
  input: {
    backgroundColor: '#222b35',
    color: '#ffffff',
    borderWidth: 1,
    borderColor: '#2a475e',
    borderRadius: 4,
    padding: 12,
    fontSize: 16,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 25,
    marginBottom: 10,
    backgroundColor: '#2a475e',
    padding: 12,
    borderRadius: 4,
  },
  switchLabel: {
    color: '#c7d5e0',
    fontSize: 14,
    fontWeight: 'bold',
  },
  submitButton: {
    backgroundColor: '#66c0f4',
    padding: 15,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 30,
  },
  submitButtonDisabled: {
    backgroundColor: '#3a6b8c',
  },
  submitButtonText: {
    color: '#1b2838',
    fontSize: 16,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
});