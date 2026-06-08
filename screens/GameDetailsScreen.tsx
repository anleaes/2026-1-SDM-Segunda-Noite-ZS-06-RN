import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity, Image, useWindowDimensions, TextInput, Alert, Platform, Modal, Switch } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useRoute, useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { MaterialIcons } from '@expo/vector-icons';
import api from '../src/services/api';

export default function GameDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { gameId } = route.params as { gameId: number };
  
  const { width } = useWindowDimensions();
  const isLargeScreen = width > 768; 

  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Estados
  const [reviews, setReviews] = useState<any[]>([]);
  const [meuComentario, setMeuComentario] = useState("");
  const [minhaNota, setMinhaNota] = useState("");
  const [recomendo, setRecomendo] = useState(true);

  const [screenshots, setScreenshots] = useState<any[]>([]);
  const [fotoDestaque, setFotoDestaque] = useState<any>(null);

  // --- ESTADOS DAS TAGS ---
  const [gameTags, setGameTags] = useState<any[]>([]);
  const [todasAsTags, setTodasAsTags] = useState<any[]>([]);
  const [revealedSpoilers, setRevealedSpoilers] = useState<number[]>([]); // Guarda os IDs das tags clicadas
  
  // Estados do Modal
  const [modalTagsVisible, setModalTagsVisible] = useState(false);
  const [selectedTagToAdd, setSelectedTagToAdd] = useState("");
  const [isPrimaryNewTag, setIsPrimaryNewTag] = useState(false);
  const [isSpoilerNewTag, setIsSpoilerNewTag] = useState(false);

  useEffect(() => {
    carregarDetalhes();
    carregarReviews();
    carregarScreenshots();
    carregarGameTags();
    carregarTodasAsTags();
  }, [gameId]);

  const carregarDetalhes = async () => {
    try {
      const response = await api.get(`/jogos/${gameId}/`);
      setGame(response.data);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const carregarReviews = async () => {
    try {
      const response = await api.get(`/review/?game=${gameId}`);
      setReviews(response.data);
    } catch (error) { console.error(error); }
  };

  const carregarScreenshots = async () => {
    try {
      const response = await api.get(`/jogos/screenshot/?game=${gameId}`);
      setScreenshots(response.data);
      if (response.data.length > 0) setFotoDestaque(response.data[0]);
      else setFotoDestaque(null); 
    } catch (error) { console.error(error); }
  };

  // --- LÓGICA DE TAGS ---
  const carregarGameTags = async () => {
    try {
      const response = await api.get(`/tag/gametag/?game=${gameId}`);
      // Ordena: Tags primárias aparecem primeiro
      const sorted = response.data.sort((a: any, b: any) => b.is_primary === a.is_primary ? 0 : b.is_primary ? 1 : -1);
      setGameTags(sorted);
    } catch (error) { console.error("Erro ao carregar tags do jogo:", error); }
  };

  const carregarTodasAsTags = async () => {
    try {
      const response = await api.get(`/tag/categoria/`);
      setTodasAsTags(response.data);
    } catch (error) { 
      console.error("Erro ao carregar tags base:", error); 
    }
  };

  const handleAddGameTag = async () => {
    if (!selectedTagToAdd) {
      Alert.alert("Atenção", "Selecione uma tag para adicionar.");
      return;
    }
    try {
      await api.post('/tag/gametag/', {
        game: gameId,
        tag: selectedTagToAdd,
        is_primary: isPrimaryNewTag,
        is_spoiler: isSpoilerNewTag
      });
      Alert.alert("Sucesso", "Tag adicionada ao jogo!");
      carregarGameTags();
      setSelectedTagToAdd("");
      setIsPrimaryNewTag(false);
      setIsSpoilerNewTag(false);
    } catch (error: any) {
      Alert.alert("Erro", "Não foi possível adicionar a tag.");
    }
  };

  const handleRemoveGameTag = async (idGameTag: number) => {
    try {
      await api.delete(`/tag/gametag/${idGameTag}/`);
      carregarGameTags();
    } catch (error) {
      Alert.alert("Erro", "Não foi possível remover a tag.");
    }
  };

  const toggleSpoiler = (idGameTag: number) => {
    if (!revealedSpoilers.includes(idGameTag)) {
      setRevealedSpoilers([...revealedSpoilers, idGameTag]);
    }
  };

  // --- LÓGICA DE CARROSSEL ---
  const handleAdicionarFoto = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: false, quality: 0.8 });
    if (!result.canceled) {
      const localUri = result.assets[0].uri;
      let filename = localUri.split('/').pop() || 'screenshot.jpg';
      if (!filename.includes('.')) filename = `${filename}.jpg`;
      
      const formData = new FormData();
      formData.append('game', String(gameId));

      if (Platform.OS === 'web') {
        const response = await fetch(localUri);
        const blob = await response.blob();
        formData.append('image', blob, filename);
      } else {
        formData.append('image', { uri: localUri, type: 'image/jpeg', name: filename } as any);
      }

      try {
        await api.post('/jogos/screenshot/', formData, { headers: { 'Content-Type': 'multipart/form-data' } }); 
        Alert.alert("Sucesso", "Foto adicionada!");
        carregarScreenshots();
      } catch (error: any) { Alert.alert("Erro", "Não foi possível enviar a imagem."); }
    }
  };

  const handleApagarFoto = () => {
    if (!fotoDestaque) return;
    Alert.alert("Apagar Foto", "Tem certeza que deseja remover esta imagem?", [
        { text: "Cancelar", style: "cancel" },
        { text: "Apagar", style: "destructive", onPress: async () => {
            try {
              await api.delete(`/jogos/screenshot/${fotoDestaque.id}/`);
              Alert.alert("Sucesso", "Foto removida.");
              carregarScreenshots(); 
            } catch (error: any) { Alert.alert("Erro", "Acesso Negado ou Falha de conexão."); }
          } 
        }
    ]);
  };

  // --- LÓGICA DE REVIEWS ---
  const handleNotaChange = (texto: string) => {
    let valorLimpo = texto.replace(',', '.').replace(/[^0-9.]/g, '');
    const partes = valorLimpo.split('.');
    if (partes.length > 2) valorLimpo = partes[0] + '.' + partes.slice(1).join('');
    if (!valorLimpo.includes('.') && valorLimpo.length === 2) {
      if (parseInt(valorLimpo) > 10 || valorLimpo.startsWith('0')) valorLimpo = `${valorLimpo[0]}.${valorLimpo[1]}`;
    }
    if (valorLimpo.includes('.')) {
      const [inteiro, decimal] = valorLimpo.split('.');
      if (decimal.length > 1) valorLimpo = `${inteiro}.${decimal.substring(0, 1)}`;
    }
    if (parseFloat(valorLimpo) > 10) valorLimpo = '10';
    setMinhaNota(valorLimpo);
  };

  const handleEnviarReview = async () => {
    if (!meuComentario.trim() || !minhaNota) return Alert.alert("Atenção", "Preencha a nota e comentário.");
    const notaNum = parseFloat(minhaNota);
    if (isNaN(notaNum) || notaNum < 0 || notaNum > 10) return Alert.alert("Atenção", "Nota inválida.");
    try {
      await api.post('/review/', { game: gameId, rating: notaNum, comment: meuComentario, recommended: recomendo });
      setMeuComentario(""); setMinhaNota(""); carregarReviews();
    } catch (error: any) { Alert.alert("Erro", "Não foi possível avaliar."); }
  };

  const renderList = (items: any[]) => {
    if (!items || items.length === 0) return 'Não informado';
    return items.map(item => item.name || item).join(', ');
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#66c0f4" /></View>;
  if (!game) return <View style={styles.center}><Text style={{color: '#fff'}}>Jogo não encontrado.</Text></View>;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Voltar à Biblioteca</Text>
      </TouchableOpacity>

      <Text style={styles.title}>{game.title}</Text>
      
      <View style={[styles.mainRow, !isLargeScreen && styles.mainRowMobile]}>
        
        {/* --- LADO ESQUERDO: CARROSSEL + TAGS JUNTOS --- */}
        <View style={[styles.carouselColumn, isLargeScreen && { flex: 2 }]}>
          
          {/* Carrossel: Imagem Principal */}
          <View style={styles.mainImageContainer}>
            {fotoDestaque ? (
              <>
                <Image source={{ uri: fotoDestaque.image }} style={styles.mainImage} resizeMode="contain" />
                <TouchableOpacity style={styles.deleteButton} onPress={handleApagarFoto}>
                  <MaterialIcons name="delete" size={24} color="#ff4444" />
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.mainImagePlaceholder}><Text style={styles.placeholderText}>Nenhuma imagem na galeria</Text></View>
            )}
          </View>

          {/* Carrossel: Miniaturas */}
          <View style={styles.thumbnailRowContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.thumbnailScroll}>
              {screenshots.map((shot) => (
                <TouchableOpacity key={shot.id} onPress={() => setFotoDestaque(shot)}>
                  <Image source={{ uri: shot.image }} style={[styles.thumbnail, fotoDestaque?.id === shot.id && styles.thumbnailActive]} />
                </TouchableOpacity>
              ))}
              <TouchableOpacity style={styles.addPhotoButton} onPress={handleAdicionarFoto}>
                <Text style={styles.addPhotoText}>+ Adicionar Foto</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>

          {/* SEÇÃO DE TAGS DENTRO DA COLUNA DO CARROSSEL */}
          <View style={styles.tagsSection}>
            <View style={styles.tagsHeader}>
              <Text style={styles.tagsTitle}>Tags da Comunidade</Text>
              <TouchableOpacity style={styles.manageTagsBtn} onPress={() => setModalTagsVisible(true)}>
                <Text style={styles.manageTagsText}>+ Gerenciar Tags</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.tagsWrapper}>
              {gameTags.length === 0 ? (
                <Text style={styles.noReviewsText}>Nenhuma tag associada a este jogo.</Text>
              ) : (
                gameTags.map(gt => {
                  const nomeDaTag = gt.tag_details?.name || 'Tag';
                  const isRevealed = revealedSpoilers.includes(gt.id);
                  
                  if (gt.is_spoiler && !isRevealed) {
                    return (
                      <TouchableOpacity key={gt.id} style={styles.tagSpoilerHidden} onPress={() => toggleSpoiler(gt.id)}>
                        <Text style={styles.tagSpoilerTextHidden}>[ SPOILER - TOQUE PARA LER ]</Text>
                      </TouchableOpacity>
                    );
                  }

                  return (
                    <View key={gt.id} style={[styles.tagNormal, gt.is_primary && styles.tagPrimary]}>
                      <Text style={[styles.tagNormalText, gt.is_primary && styles.tagPrimaryText]}>
                        {nomeDaTag}
                      </Text>
                    </View>
                  );
                })
              )}
            </View>
          </View>
          {/* FIM DA SEÇÃO DE TAGS */}

        </View>
        {/* --- FIM DO LADO ESQUERDO --- */}


        {/* --- LADO DIREITO: Informações --- */}
        <View style={[styles.infoColumn, isLargeScreen && { flex: 1 }]}>
          {game.cover_image ? (
            <Image source={{ uri: game.cover_image }} style={styles.coverImage} resizeMode="cover" />
          ) : (
            <View style={styles.coverPlaceholder}><Text style={styles.placeholderText}>Sem Capa</Text></View>
          )}

          <View style={styles.detailsBox}>
            <Text style={styles.description}>{game.description}</Text>
            <View style={styles.separator} />
            <Text style={styles.detailRow}><Text style={styles.detailLabel}>Ano:</Text> {game.release_year}</Text>
            <Text style={styles.detailRow}><Text style={styles.detailLabel}>Nota Média:</Text> {game.average_rating ? game.average_rating : 'Sem avaliações'}</Text>
            <Text style={styles.detailRow}><Text style={styles.detailLabel}>Desenvolvedora:</Text> {game.developer ? game.developer.name : 'Não informado'}</Text>
            <Text style={styles.detailRow}><Text style={styles.detailLabel}>Gêneros:</Text> {renderList(game.genre)}</Text>
            <Text style={styles.detailRow}><Text style={styles.detailLabel}>Consoles:</Text> {renderList(game.consoles)}</Text>
          </View>
        </View>

      </View>

      {/* SEÇÃO DE REVIEWS */}
      <View style={styles.reviewsSection}>
        <Text style={styles.sectionTitle}>Avaliações</Text>
        <View style={styles.writeReviewBox}>
          <View style={styles.reviewControlsRow}>
            <View style={styles.ratingInputContainer}>
              <Text style={styles.ratingLabel}>Nota (0-10):</Text>
              <TextInput style={styles.ratingInput} keyboardType="numeric" maxLength={4} value={minhaNota} onChangeText={handleNotaChange} placeholder="Ex: 8.5" placeholderTextColor="#666" />
            </View>
            <TouchableOpacity style={[styles.recommendButton, recomendo ? styles.recommendActive : styles.recommendInactive]} onPress={() => setRecomendo(!recomendo)}>
              <Text style={styles.recommendText}>{recomendo ? '👍 Recomendo' : '👎 Não Recomendo'}</Text>
            </TouchableOpacity>
          </View>
          <TextInput style={styles.reviewInput} multiline placeholder="Escreva aqui..." placeholderTextColor="#8f98a0" value={meuComentario} onChangeText={setMeuComentario} />
          <TouchableOpacity style={styles.submitReviewButton} onPress={handleEnviarReview}>
            <Text style={styles.submitReviewText}>Publicar Avaliação</Text>
          </TouchableOpacity>
        </View>

        {reviews.length === 0 ? (
          <Text style={styles.noReviewsText}>Nenhuma avaliação ainda.</Text>
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

      {/* --- POP-UP DE GERENCIAR TAGS (MODAL) --- */}
      <Modal visible={modalTagsVisible} animationType="fade" transparent={true} onRequestClose={() => setModalTagsVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Gerenciar Tags do Jogo</Text>
            
            <View style={styles.separator} />

            {/* Parte 1: Adicionar Tag */}
            <Text style={styles.modalSubtitle}>Adicionar Nova Tag</Text>
            <View style={styles.pickerContainerModal}>
              <Picker selectedValue={selectedTagToAdd} onValueChange={setSelectedTagToAdd} style={styles.pickerTextModal}>
                <Picker.Item label="Selecione uma Tag..." value="" color="#000000" />
                {todasAsTags.map(t => <Picker.Item key={t.id} label={t.name} value={t.id} color="#000000" />)}
              </Picker>
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Destaque Principal? (Primária)</Text>
              <Switch value={isPrimaryNewTag} onValueChange={setIsPrimaryNewTag} trackColor={{ false: '#767577', true: '#66c0f4' }} />
            </View>
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Contém Spoiler?</Text>
              <Switch value={isSpoilerNewTag} onValueChange={setIsSpoilerNewTag} trackColor={{ false: '#767577', true: '#ff4444' }} />
            </View>

            <TouchableOpacity style={styles.addTagButton} onPress={handleAddGameTag}>
              <Text style={styles.addTagButtonText}>Adicionar ao Jogo</Text>
            </TouchableOpacity>

            <View style={[styles.separator, {marginTop: 20}]} />

            {/* Parte 2: Remover Tags Existentes */}
            <Text style={styles.modalSubtitle}>Tags Aplicadas (Clique para remover)</Text>
            <ScrollView style={styles.tagsListModal}>
              {gameTags.length === 0 ? <Text style={styles.noReviewsText}>Nenhuma tag ainda.</Text> : null}
              {gameTags.map(gt => (
                <View key={gt.id} style={styles.modalTagItem}>
                  <Text style={styles.modalTagItemText}>
                    {gt.tag_details?.name} {gt.is_primary ? '(Primária)' : ''} {gt.is_spoiler ? '(Spoiler)' : ''}
                  </Text>
                  <TouchableOpacity onPress={() => handleRemoveGameTag(gt.id)}>
                    <MaterialIcons name="delete" size={24} color="#ff4444" />
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.closeModalButton} onPress={() => setModalTagsVisible(false)}>
              <Text style={styles.closeModalButtonText}>Fechar Janela</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  
  // Carrossel
  carouselColumn: { display: 'flex', flexDirection: 'column', gap: 10 },
  mainImageContainer: { width: '100%', height: 350, backgroundColor: '#000000', borderRadius: 4, overflow: 'hidden' },
  mainImage: { width: '100%', height: '100%' },
  mainImagePlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  thumbnailRowContainer: { backgroundColor: '#171a21', borderRadius: 4, padding: 10 },
  thumbnailScroll: { gap: 10, alignItems: 'center' },
  thumbnail: { width: 120, height: 68, borderRadius: 4, opacity: 0.5 },
  thumbnailActive: { opacity: 1, borderWidth: 2, borderColor: '#66c0f4' },
  addPhotoButton: { width: 120, height: 68, backgroundColor: 'rgba(102, 192, 244, 0.1)', borderWidth: 1, borderColor: '#66c0f4', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
  addPhotoText: { color: '#66c0f4', fontWeight: 'bold', fontSize: 13 },
  deleteButton: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 20 },
  
  // Informações
  infoColumn: { display: 'flex', flexDirection: 'column', gap: 10 },
  coverImage: { width: '100%', aspectRatio: 3/4, borderRadius: 4 },
  coverPlaceholder: { width: '100%', aspectRatio: 3/4, backgroundColor: '#2a475e', justifyContent: 'center', alignItems: 'center', borderRadius: 4 },
  detailsBox: { backgroundColor: 'rgba(0, 0, 0, 0.2)', padding: 15, borderRadius: 4 },
  description: { color: '#c7d5e0', fontSize: 14, lineHeight: 20, marginBottom: 15 },
  separator: { height: 1, backgroundColor: '#2a475e', marginBottom: 15 },
  detailRow: { color: '#66c0f4', fontSize: 13, marginBottom: 6 },
  detailLabel: { color: '#8f98a0', fontWeight: 'bold' },
  placeholderText: { color: '#8f98a0', fontWeight: 'bold', textAlign: 'center' },

  // --- ESTILOS DE TAGS (NOVO) ---
  tagsSection: { marginTop: 10, marginBottom: 20 },
  tagsHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  tagsTitle: { fontSize: 18, fontWeight: 'bold', color: '#fff', textTransform: 'uppercase' },
  manageTagsBtn: { backgroundColor: 'rgba(102, 192, 244, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  manageTagsText: { color: '#66c0f4', fontWeight: 'bold', fontSize: 12 },
  tagsWrapper: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  
  tagNormal: { backgroundColor: '#2a475e', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15 },
  tagNormalText: { color: '#c7d5e0', fontSize: 13, fontWeight: 'bold' },
  
  tagPrimary: { backgroundColor: '#66c0f4' },
  tagPrimaryText: { color: '#1b2838' },
  
  tagSpoilerHidden: { backgroundColor: '#000000', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 15, borderWidth: 1, borderColor: '#444' },
  tagSpoilerTextHidden: { color: '#666', fontSize: 12, fontWeight: 'bold', letterSpacing: 1 },

  // --- ESTILOS DO MODAL ---
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  modalContent: { backgroundColor: '#171a21', borderRadius: 8, padding: 20, maxHeight: '90%', borderWidth: 1, borderColor: '#2a475e' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#fff', textAlign: 'center', marginBottom: 10 },
  modalSubtitle: { fontSize: 16, fontWeight: 'bold', color: '#66c0f4', marginTop: 10, marginBottom: 10 },
  pickerContainerModal: { backgroundColor: '#2a475e', borderRadius: 4, overflow: 'hidden', marginBottom: 15 },
  pickerTextModal: { color: '#fff' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#222b35', padding: 12, borderRadius: 4, marginBottom: 10 },
  switchLabel: { color: '#c7d5e0', fontSize: 14, fontWeight: 'bold' },
  addTagButton: { backgroundColor: '#66c0f4', padding: 12, borderRadius: 4, alignItems: 'center', marginTop: 5 },
  addTagButtonText: { color: '#1b2838', fontWeight: 'bold', fontSize: 15 },
  
  tagsListModal: { backgroundColor: '#222b35', borderRadius: 4, padding: 10, maxHeight: 150 },
  modalTagItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#2a475e' },
  modalTagItemText: { color: '#c7d5e0', fontSize: 15, flex: 1 },
  closeModalButton: { backgroundColor: '#3a6b8c', padding: 15, borderRadius: 4, alignItems: 'center', marginTop: 20 },
  closeModalButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },

  // Reviews
  reviewsSection: { marginTop: 20, borderTopWidth: 1, borderTopColor: '#2a475e', paddingTop: 20 },
  sectionTitle: { fontSize: 22, fontWeight: 'bold', color: '#ffffff', marginBottom: 15, textTransform: 'uppercase' },
  writeReviewBox: { backgroundColor: '#171a21', padding: 15, borderRadius: 4, marginBottom: 25 },
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