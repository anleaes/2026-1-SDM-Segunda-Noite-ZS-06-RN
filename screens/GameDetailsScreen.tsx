import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Image, useWindowDimensions, TextInput, Alert, Platform } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import api from '../src/services/api';


export default function GameDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { gameId } = route.params as { gameId: number };
  
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768; 

  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Estados de Reviews
  const [reviews, setReviews] = useState<any[]>([]);
  const [meuComentario, setMeuComentario] = useState("");
  const [minhaNota, setMinhaNota] = useState("");
  const [recomendo, setRecomendo] = useState(true);

  // Estados do Carrossel
  const [screenshots, setScreenshots] = useState<any[]>([]);
  const [imagemDestaque, setImagemDestaque] = useState<string | null>(null);

  useEffect(() => {
    carregarDetalhes();
    carregarReviews();
    carregarScreenshots();
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

  // --- LÓGICA DO CARROSSEL ---
  const carregarScreenshots = async () => {
    try {
      const response = await api.get(`/jogos/screenshot/?game=${gameId}`);
      setScreenshots(response.data);
      // Se tiver fotos, coloca a primeira como destaque na tela grande
      if (response.data.length > 0) {
        setImagemDestaque(response.data[0].image);
      }
    } catch (error) {
      console.error("Erro ao carregar fotos:", error);
    }
  };

  const handleAdicionarFoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled) {
      const localUri = result.assets[0].uri;
      
      // 1. Pegamos o nome do arquivo da URL
      let filename = localUri.split('/').pop() || 'screenshot.jpg';
      
      // 2. A CORREÇÃO: Se não tiver extensão (comum na Web), nós forçamos o .jpg!
      if (!filename.includes('.')) {
        filename = `${filename}.jpg`;
      }
      
      const formData = new FormData();
      formData.append('game', String(gameId));

      if (Platform.OS === 'web') {
        const response = await fetch(localUri);
        const blob = await response.blob();
        formData.append('image', blob, filename);
      } else {
        formData.append('image', {
          uri: localUri,
          type: 'image/jpeg',
          name: filename,
        } as any);
      }

      try {
        await api.post('/jogos/screenshot/', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        }); 
        
        Alert.alert("Sucesso", "Foto adicionada!");
        carregarScreenshots();
      } catch (error: any) {
        console.error("Erro no upload:", error.response?.data || error.message);
        Alert.alert("Erro", "Não foi possível enviar a imagem.");
      }
    }
  };

  // --- LÓGICA DE REVIEWS ---
  const handleNotaChange = (texto: string) => {
    let valorLimpo = texto.replace(',', '.');
    valorLimpo = valorLimpo.replace(/[^0-9.]/g, '');
    const partes = valorLimpo.split('.');
    if (partes.length > 2) {
      valorLimpo = partes[0] + '.' + partes.slice(1).join('');
    }
    if (!valorLimpo.includes('.') && valorLimpo.length === 2) {
      if (parseInt(valorLimpo) > 10 || valorLimpo.startsWith('0')) {
        valorLimpo = `${valorLimpo[0]}.${valorLimpo[1]}`;
      }
    }
    if (valorLimpo.includes('.')) {
      const [inteiro, decimal] = valorLimpo.split('.');
      if (decimal.length > 1) {
        valorLimpo = `${inteiro}.${decimal.substring(0, 1)}`;
      }
    }
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
      setMeuComentario("");
      setMinhaNota("");
      carregarReviews();
    } catch (error: any) {
      Alert.alert("Erro", "Não foi possível enviar a avaliação.");
    }
  };

  const renderList = (items: any[]) => {
    if (!items || items.length === 0) return 'Não informado';
    return items.map(item => item.name || item).join(', ');
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
        
        {/* --- LADO ESQUERDO: NOVO CARROSSEL --- */}
        <View style={[styles.carouselColumn, isLargeScreen && { flex: 2 }]}>
          
          {/* Imagem Destaque */}
          <View style={styles.mainImageContainer}>
            {imagemDestaque ? (
              <Image source={{ uri: imagemDestaque }} style={styles.mainImage} resizeMode="contain" />
            ) : (
              <View style={styles.mainImagePlaceholder}>
                <Text style={styles.placeholderText}>Nenhuma imagem cadastrada na galeria</Text>
              </View>
            )}
          </View>

          {/* Miniaturas e Botão */}
          <View style={styles.thumbnailRowContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailScroll}>
              
              {screenshots.map((shot) => (
                <TouchableOpacity key={shot.id} onPress={() => setImagemDestaque(shot.image)}>
                  <Image 
                    source={{ uri: shot.image }} 
                    style={[styles.thumbnail, imagemDestaque === shot.image && styles.thumbnailActive]} 
                  />
                </TouchableOpacity>
              ))}
              
              {/* O botão fica sempre no final da lista */}
              <TouchableOpacity style={styles.addPhotoButton} onPress={handleAdicionarFoto}>
                <Text style={styles.addPhotoText}>+ Adicionar Foto</Text>
              </TouchableOpacity>
              
            </ScrollView>
          </View>

        </View>

        {/* LADO DIREITO: Informações */}
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
            <Text style={styles.detailRow}><Text style={styles.detailLabel}>Desenvolvedora:</Text> {game.developer ? game.developer.name : 'Não informado'}</Text>
            <Text style={styles.detailRow}><Text style={styles.detailLabel}>Gêneros:</Text> {renderList(game.genre)}</Text>
            <Text style={styles.detailRow}><Text style={styles.detailLabel}>Consoles:</Text> {renderList(game.console)}</Text>
          </View>
        </View>
        
      </View>

      {/* SEÇÃO DE REVIEWS */}
      <View style={styles.reviewsSection}>
        <Text style={styles.sectionTitle}>Avaliações da Comunidade</Text>
        
        <View style={styles.writeReviewBox}>
          <Text style={styles.writeReviewTitle}>Escreva sua análise</Text>
          <View style={styles.reviewControlsRow}>
            <View style={styles.ratingInputContainer}>
              <Text style={styles.ratingLabel}>Nota (0-10):</Text>
              <TextInput 
                style={styles.ratingInput} keyboardType="numeric" maxLength={4}
                value={minhaNota} onChangeText={handleNotaChange} placeholder="Ex: 8.5" placeholderTextColor="#666"
              />
            </View>
            <TouchableOpacity style={[styles.recommendButton, recomendo ? styles.recommendActive : styles.recommendInactive]} onPress={() => setRecomendo(!recomendo)}>
              <Text style={styles.recommendText}>{recomendo ? '👍 Recomendo' : '👎 Não Recomendo'}</Text>
            </TouchableOpacity>
          </View>
          <TextInput style={styles.reviewInput} multiline placeholder="O que você achou do jogo? Escreva aqui..." placeholderTextColor="#8f98a0" value={meuComentario} onChangeText={setMeuComentario} />
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
                  {rev.recommended ? <Text style={styles.tagRecomenda}>👍 Recomendado</Text> : <Text style={styles.tagNaoRecomenda}>👎 Não Recomendado</Text>}
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
  
  // --- ESTILOS DO CARROSSEL ---
  mainImageContainer: { width: '100%', height: 350, backgroundColor: '#000000', borderRadius: 4, overflow: 'hidden' },
  mainImage: { width: '100%', height: '100%' },
  mainImagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  
  thumbnailRowContainer: { backgroundColor: '#171a21', borderRadius: 4, padding: 10 },
  thumbnailScroll: { gap: 10, alignItems: 'center' },
  thumbnail: { width: 120, height: 68, borderRadius: 4, opacity: 0.5 },
  thumbnailActive: { opacity: 1, borderWidth: 2, borderColor: '#66c0f4' },
  
  addPhotoButton: { width: 120, height: 68, backgroundColor: 'rgba(102, 192, 244, 0.1)', borderWidth: 1, borderColor: '#66c0f4', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
  addPhotoText: { color: '#66c0f4', fontWeight: 'bold', fontSize: 13 },
  // -----------------------------
  
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