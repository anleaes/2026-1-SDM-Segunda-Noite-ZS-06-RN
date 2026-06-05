import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function GameCreateScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Cadastrar Novo Jogo</Text>
      <Text>O nosso formulário dinâmico vai entrar aqui!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
});