import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../src/services/api';

export default function GameDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { gameId } = route.params as { gameId: number };
  
  // Pegamos a largura da tela para garantir que não quebre em celulares estreitos
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768; // Se for maior que um tablet/celular deitado

  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregarDetalhes();
  }, [gameId]);

  const carregarDetalhes = async () => {
    try {
      const response = await api.get(`/jogos/${gameId}/`);
      setGame(response.data);
    } catch (error) {
      console.error("Erro ao carregar o jogo:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNÇÕES DE AJUDA PARA RENDERIZAR ARRAYS/OBJETOS ---
  // Como gêneros e consoles vêm como listas, precisamos formatá-los para texto
  const renderList = (items: any[]) => {
    if (!items || items.length === 0) return 'Não informado';
    // Se vier como objeto (ex: {id: 1, name: 'Ação'}), pega o name. Se vier só o texto/ID, mostra ele.
    return items.map(item => item.name || item).join(', ');
  };

  const renderDeveloper = (dev: any) => {
    if (!dev) return 'Não informado';
    return dev.name || dev;
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#66c0f4" /></View>;
  }

  if (!game) {
    return <View style={styles.center}><Text style={{color: '#fff'}}>Jogo não encontrado.</Text></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Voltar à Biblioteca</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{game.title}</Text>
      
      {/* --- CONTAINER PRINCIPAL (DIVISÃO 2/3 e 1/3) --- */}
      <View style={[styles.mainRow, !isLargeScreen && styles.mainRowMobile]}>
        
        {/* LADO ESQUERDO: Carrossel (Ocupa 2 partes da tela) */}
        <View style={styles.carouselColumn}>
          <View style={styles.mainImagePlaceholder}>
            <Text style={styles.placeholderText}>[Imagem Principal do Carrossel Virá Aqui]</Text>
          </View>
          <View style={styles.thumbnailRowPlaceholder}>
            <Text style={styles.placeholderText}>[Miniaturas Virão Aqui]</Text>
          </View>
        </View>

        {/* LADO DIREITO: Capa e Informações (Ocupa 1 parte da tela) */}
        <View style={styles.infoColumn}>
          {game.cover_image ? (
            <Image source={{ uri: game.cover_image }} style={styles.coverImage} resizeMode="cover" />
          ) : (
            <View style={styles.coverPlaceholder}>
              <Text style={styles.placeholderText}>Sem Capa</Text>
            </View>
          )}

          <View style={styles.detailsBox}>
            <Text style={styles.description}>{game.description}</Text>
            <View style={styles.separator} />
            
            <Text style={styles.detailRow}><Text style={styles.detailLabel}>Ano:</Text> {game.release_year}</Text>
            <Text style={styles.detailRow}><Text style={styles.detailLabel}>Nota Média:</Text> {game.average_rating ? game.average_rating : 'Sem avaliações'}</Text>
            <Text style={styles.detailRow}><Text style={styles.detailLabel}>Desenvolvedora:</Text> {renderDeveloper(game.developer)}</Text>
            <Text style={styles.detailRow}><Text style={styles.detailLabel}>Gêneros:</Text> {renderList(game.genre)}</Text>
            <Text style={styles.detailRow}><Text style={styles.detailLabel}>Consoles:</Text> {renderList(game.console)}</Text>
          </View>
        </View>
        
      </View>

      {/* --- PARTE INFERIOR: Reviews (Ocupa a largura inteira) --- */}
      <View style={styles.reviewsSection}>
        <Text style={styles.sectionTitle}>Avaliações da Comunidade</Text>
        <View style={styles.reviewsPlaceholder}>
          <Text style={styles.placeholderText}>[Caixa de escrever Review e Lista de Reviews Virão Aqui]</Text>
        </View>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#1b2838' }, 
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#1b2838' },
  
  backButton: { alignSelf: 'flex-start', backgroundColor: 'rgba(102, 192, 244, 0.2)', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 6, marginBottom: 20 },
  backButtonText: { color: '#66c0f4', fontSize: 14, fontWeight: 'bold' },
  title: { fontSize: 32, fontWeight: 'bold', color: '#ffffff', marginBottom: 20 },
  
  // Layout da Linha Principal
  mainRow: { flexDirection: 'row', gap: 20, marginBottom: 30 },
  mainRowMobile: { flexDirection: 'column' }, // Empilha um embaixo do outro se a tela for pequena
  
  // Coluna Esquerda (2/3)
  carouselColumn: { flex: 2, display: 'flex', flexDirection: 'column', gap: 10 },
  mainImagePlaceholder: { flex: 1, minHeight: 350, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
  thumbnailRowPlaceholder: { height: 80, backgroundColor: '#2a475e', justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
  
  // Coluna Direita (1/3)
  infoColumn: { flex: 1, display: 'flex', flexDirection: 'column', gap: 10 },
  coverImage: { width: '100%', aspectRatio: 3/4, borderRadius: 4 },
  coverPlaceholder: { width: '100%', aspectRatio: 3/4, backgroundColor: '#2a475e', justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
  detailsBox: { backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: 15, borderRadius: 4, flex: 1 },
  
  // Textos e Labels
  description: { color: '#c7d5e0', fontSize: 14, lineHeight: 20, marginBottom: 15 },
  separator: { height: 1, backgroundColor: '#2a475e', marginBottom: 15 },
  detailRow: { color: '#66c0f4', fontSize: 13, marginBottom: 6 },
  detailLabel: { color: '#8f98a0', fontWeight: 'bold' },
  placeholderText: { color: '#8f98a0', fontWeight: 'bold', textAlign: 'center' },

  // Seção de Reviews
  reviewsSection: { marginTop: 20 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', marginBottom: 15, textTransform: 'uppercase' },
  reviewsPlaceholder: { height: 250, backgroundColor: '#2a475e', justifyContent: 'center', alignItems: 'center', borderRadius: 4 }
});