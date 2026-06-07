import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Image, useWindowDimensions, TextInput, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import api from '../src/services/api';

export default function GameDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { gameId } = route.params as { gameId: number };
  
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768; 

  // Estados do Jogo
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Estados das Reviews
  const [reviews, setReviews] = useState<any[]>([]);
  const [meuComentario, setMeuComentario] = useState("");
  const [minhaNota, setMinhaNota] = useState("");
  const [recomendo, setRecomendo] = useState(true);

  useEffect(() => {
    carregarDetalhes();
    carregarReviews();
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

  const carregarReviews = async () => {
    try {
      const response = await api.get(`/review/?game=${gameId}`);
      setReviews(response.data);
    } catch (error) {
      console.error("Erro ao carregar reviews:", error);
    }
  };

// --- FUNÇÃO ATUALIZADA: Máscara Inteligente para a Nota ---
  const handleNotaChange = (texto: string) => {
    // 1. Troca vírgula por ponto
    let valorLimpo = texto.replace(',', '.');
    
    // 2. Remove tudo que não for número ou ponto
    valorLimpo = valorLimpo.replace(/[^0-9.]/g, '');
    
    // 3. Garante que só tenha UM ponto decimal
    const partes = valorLimpo.split('.');
    if (partes.length > 2) {
      valorLimpo = partes[0] + '.' + partes.slice(1).join('');
    }

    // 4. A Mágica do "28 -> 2.8":
    // Se o usuário digitar 2 números sem ponto (ex: "28", "11", "05")
    if (!valorLimpo.includes('.') && valorLimpo.length === 2) {
      // Se for maior que 10 (ex: 28) ou começar com 0 (ex: 05), coloca o ponto no meio.
      // Se for exatamente "10", ele deixa passar normalmente.
      if (parseInt(valorLimpo) > 10 || valorLimpo.startsWith('0')) {
        valorLimpo = `${valorLimpo[0]}.${valorLimpo[1]}`;
      }
    }

    // 5. Limita a apenas uma casa decimal (ex: impede "2.85")
    if (valorLimpo.includes('.')) {
      const [inteiro, decimal] = valorLimpo.split('.');
      if (decimal.length > 1) {
        valorLimpo = `${inteiro}.${decimal.substring(0, 1)}`;
      }
    }

    // 6. Trava no 10 se a pessoa tentar burlar digitando algo como "10.5"
    if (parseFloat(valorLimpo) > 10) {
      valorLimpo = '10';
    }

    setMinhaNota(valorLimpo);
  };

  const handleEnviarReview = async () => {
    if (!meuComentario.trim() || !minhaNota) {
      Alert.alert("Atenção", "Preencha a nota e o comentário para avaliar.");
      return;
    }

    const notaNum = parseFloat(minhaNota);
    if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) {
      Alert.alert("Atenção", "A nota deve ser um número válido entre 0 e 10.");
      return;
    }

    try {
      await api.post('/review/', {
        game: gameId,
        rating: notaNum,
        comment: meuComentario,
        recommended: recomendo
      });
      
      Alert.alert("Sucesso", "Sua avaliação foi publicada!");
      setMeuComentario("");
      setMinhaNota("");
      
      carregarReviews();
    } catch (error: any) {
      console.error("Motivo do Erro 400:", error.response?.data);
      Alert.alert("Erro", "Não foi possível enviar a avaliação.");
    }
  };

  const renderList = (items: any[]) => {
    if (!items || items.length === 0) return 'Não informado';
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
      
      <View style={[styles.mainRow, !isLargeScreen && styles.mainRowMobile]}>
        
        <View style={[styles.carouselColumn, isLargeScreen && { flex: 2 }]}>
          <View style={styles.mainImagePlaceholder}>
            <Text style={styles.placeholderText}>[Imagem Principal do Carrossel Virá Aqui]</Text>
          </View>
          <View style={styles.thumbnailRowPlaceholder}>
            <Text style={styles.placeholderText}>[Miniaturas Virão Aqui]</Text>
          </View>
        </View>

        <View style={[styles.infoColumn, isLargeScreen && { flex: 1 }]}>
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

      <View style={styles.reviewsSection}>
        <Text style={styles.sectionTitle}>Avaliações da Comunidade</Text>
        
        <View style={styles.writeReviewBox}>
          <Text style={styles.writeReviewTitle}>Escreva sua análise</Text>
          
          <View style={styles.reviewControlsRow}>
            <View style={styles.ratingInputContainer}>
              <Text style={styles.ratingLabel}>Nota (0-10):</Text>
              <TextInput 
                style={styles.ratingInput} 
                keyboardType="numeric" 
                maxLength={4}
                value={minhaNota}
                onChangeText={handleNotaChange} // <-- Conectado à máscara
                placeholder="Ex: 8.5"
                placeholderTextColor="#666"
              />
            </View>

            <TouchableOpacity 
              style={[styles.recommendButton, recomendo ? styles.recommendActive : styles.recommendInactive]}
              onPress={() => setRecomendo(!recomendo)}
            >
              <Text style={styles.recommendText}>{recomendo ? '👍 Recomendo' : '👎 Não Recomendo'}</Text>
            </TouchableOpacity>
          </View>

          <TextInput 
            style={styles.reviewInput}
            multiline
            placeholder="O que você achou do jogo? Escreva aqui..."
            placeholderTextColor="#8f98a0"
            value={meuComentario}
            onChangeText={setMeuComentario}
          />

          <TouchableOpacity style={styles.submitReviewButton} onPress={handleEnviarReview}>
            <Text style={styles.submitReviewText}>Publicar Avaliação</Text>
          </TouchableOpacity>
        </View>

        {reviews.length === 0 ? (
          <Text style={styles.noReviewsText}>Nenhuma avaliação ainda. Seja o primeiro a avaliar!</Text>
        ) : (
          reviews.map((rev) => (
            <View key={rev.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewUser}>@{rev.username}</Text>
                <View style={styles.reviewStats}>
                  <Text style={styles.reviewRatingTag}>Nota: {rev.rating}</Text>
                  {rev.recommended ? (
                    <Text style={styles.tagRecomenda}>👍 Recomendado</Text>
                  ) : (
                    <Text style={styles.tagNaoRecomenda}>👎 Não Recomendado</Text>
                  )}
                </View>
              </View>
              <Text style={styles.reviewComment}>{rev.comment}</Text>
            </View>
          ))
        )}

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
  
  mainRow: { flexDirection: 'row', gap: 20, marginBottom: 30 },
  mainRowMobile: { flexDirection: 'column-reverse' }, 
  
  carouselColumn: { display: 'flex', flexDirection: 'column', gap: 10 },
  mainImagePlaceholder: { width: '100%', height: 350, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
  thumbnailRowPlaceholder: { height: 80, backgroundColor: '#2a475e', justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
  
  infoColumn: { display: 'flex', flexDirection: 'column', gap: 10 },
  coverImage: { width: '100%', aspectRatio: 3/4, borderRadius: 4 },
  coverPlaceholder: { width: '100%', aspectRatio: 3/4, backgroundColor: '#2a475e', justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
  detailsBox: { backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: 15, borderRadius: 4 },
  
  description: { color: '#c7d5e0', fontSize: 14, lineHeight: 20, marginBottom: 15 },
  separator: { height: 1, backgroundColor: '#2a475e', marginBottom: 15 },
  detailRow: { color: '#66c0f4', fontSize: 13, marginBottom: 6 },
  detailLabel: { color: '#8f98a0', fontWeight: 'bold' },
  placeholderText: { color: '#8f98a0', fontWeight: 'bold', textAlign: 'center' },

  reviewsSection: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#2a475e', paddingTop: 20 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', marginBottom: 15, textTransform: 'uppercase' },
  
  writeReviewBox: { backgroundColor: '#171a21', padding: 15, borderRadius: 4, marginBottom: 25 },
  writeReviewTitle: { color: '#e5e4e2', fontSize: 16, fontWeight: 'bold', marginBottom: 15 },
  
  reviewControlsRow: { flexDirection: 'row', alignItems: 'center', gap: 15, marginBottom: 15 },
  ratingInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2a475e', borderRadius: 4, paddingHorizontal: 10 },
  ratingLabel: { color: '#c7d5e0', fontWeight: 'bold', marginRight: 5 },
  ratingInput: { color: '#fff', fontSize: 16, paddingVertical: 8, width: 60 },
  
  recommendButton: { paddingVertical: 8, paddingHorizontal: 15, borderRadius: 4 },
  recommendActive: { backgroundColor: 'rgba(102, 192, 244, 0.2)', borderWidth: 1, borderColor: '#66c0f4' },
  recommendInactive: { backgroundColor: 'rgba(255, 99, 71, 0.2)', borderWidth: 1, borderColor: 'tomato' },
  recommendText: { color: '#fff', fontWeight: 'bold' },
  
  reviewInput: { backgroundColor: '#222b35', color: '#c7d5e0', borderRadius: 4, padding: 15, fontSize: 15, minHeight: 100, textAlignVertical: 'top', marginBottom: 15 },
  submitReviewButton: { backgroundColor: '#66c0f4', paddingVertical: 12, borderRadius: 4, alignItems: 'center' },
  submitReviewText: { color: '#1b2838', fontSize: 16, fontWeight: 'bold' },

  noReviewsText: { color: '#8f98a0', fontStyle: 'italic', marginTop: 10 },
  
  reviewCard: { backgroundColor: 'rgba(0, 0, 0, 0.3)', padding: 15, borderRadius: 4, marginBottom: 15 },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 10 },
  reviewUser: { color: '#e5e4e2', fontSize: 16, fontWeight: 'bold' },
  reviewStats: { flexDirection: 'row', gap: 10 },
  reviewRatingTag: { backgroundColor: '#3a6b8c', color: '#fff', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4, fontSize: 12, fontWeight: 'bold' },
  tagRecomenda: { color: '#66c0f4', fontWeight: 'bold', fontSize: 13 },
  tagNaoRecomenda: { color: 'tomato', fontWeight: 'bold', fontSize: 13 },
  reviewComment: { color: '#acb2b8', fontSize: 14, lineHeight: 20 },
});