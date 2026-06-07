import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useRoute } from '@react-navigation/native';
import api from '../src/services/api';

export default function GameDetailsScreen() {
  const route = useRoute();
  // Pega o ID do jogo que foi clicado lá na lista
  const { gameId } = route.params as { gameId: number };

  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDetalhes();
  }, [gameId]);

  const carregarDetalhes = async () => {
    try {
      // Ajuste '/jogos/' para a exata URL que retorna os detalhes de um jogo no seu Django
      const response = await api.get(`/jogos/${gameId}/`);
      setGame(response.data);
    } catch (error) {
      console.error("Erro ao carregar o jogo:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#007BFF" /></View>;
  }

  if (!game) {
    return <View style={styles.center}><Text>Jogo não encontrado.</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{game.title}</Text>
      
      {/* ESPAÇO PARA O CARROSSEL DE FOTOS (Faremos no próximo passo) */}
      <View style={styles.imagePlaceholder}>
        <Text style={styles.placeholderText}>[Carrossel de Imagens Virá Aqui]</Text>
      </View>

      {/* INFORMAÇÕES BÁSICAS */}
      <View style={styles.infoBox}>
        <Text style={styles.description}>{game.description}</Text>
        <Text style={styles.detail}>Ano: {game.release_year}</Text>
        <Text style={styles.detail}>Nota Média: {game.average_rating ? game.average_rating : 'Sem notas'}</Text>
      </View>

      {/* ESPAÇO PARA AS REVIEWS (Faremos depois das fotos) */}
      <View style={styles.reviewsPlaceholder}>
        <Text style={styles.placeholderText}>[Sistema de Reviews Virá Aqui]</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 15, backgroundColor: '#1b2838' }, // Cor de fundo estilo Steam
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#ffffff', marginBottom: 15, textAlign: 'center' },
  
  imagePlaceholder: { height: 200, backgroundColor: '#2a475e', justifyContent: 'center', alignItems: 'center', marginBottom: 20, borderRadius: 8 },
  placeholderText: { color: '#66c0f4', fontWeight: 'bold' },
  
  infoBox: { backgroundColor: '#2a475e', padding: 15, borderRadius: 8, marginBottom: 20 },
  description: { color: '#c7d5e0', fontSize: 16, marginBottom: 10, lineHeight: 22 },
  detail: { color: '#66c0f4', fontSize: 14, fontWeight: 'bold', marginTop: 5 },

  reviewsPlaceholder: { height: 300, backgroundColor: '#2a475e', justifyContent: 'center', alignItems: 'center', borderRadius: 8 }
});