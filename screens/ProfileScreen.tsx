import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, Alert, Platform } from 'react-native';
import { useFocusEffect } from '@react-navigation/native'; // <-- Nova importação para atualizar a tela
import * as ImagePicker from 'expo-image-picker';
import api from '../src/services/api';

export default function ProfileScreen() {
  const [profileId, setProfileId] = useState<number | null>(null);
  
  // Novo estado para o Nome de Usuário que vem do Backend
  const [username, setUsername] = useState("");
  
  const [avatar, setAvatar] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [gamesAdded, setGamesAdded] = useState(0);

  // 1. OBRIGA A BUSCAR OS DADOS TODA VEZ QUE A TELA APARECE
  useFocusEffect(
    useCallback(() => {
      carregarPerfil();
    }, [])
  );

  const carregarPerfil = async () => {
    try {
      const response = await api.get('/perfis de usuarios/');
      
      if (response.data && response.data.length > 0) {
        const meuPerfil = response.data[0]; 
        setProfileId(meuPerfil.id);
        setBio(meuPerfil.bio || "");
        setCountry(meuPerfil.country || "");
        setGamesAdded(meuPerfil.games_added || 0);
        setAvatar(meuPerfil.avatar || null);
        setUsername(meuPerfil.username || ""); // Puxa o nome
      } else {
        // ESSENCIAL: Se o usuário novo não tem perfil, limpa a tela inteira!
        setProfileId(null);
        setBio("");
        setCountry("");
        setGamesAdded(0);
        setAvatar(null);
        setUsername("");
      }
    } catch (error) {
      console.error("Erro ao carregar perfil:", error);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setAvatar(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    const formData = new FormData();
    formData.append("bio", bio);
    formData.append("country", country);

    if (avatar && !avatar.startsWith('http')) { 
      if (Platform.OS === 'web') {
        const response = await fetch(avatar);
        const blob = await response.blob();
        formData.append("avatar", blob, "avatar.jpg");
      } else {
        const filename = avatar.split('/').pop() || 'avatar.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        formData.append("avatar", { uri: avatar, name: filename, type } as any);
      }
    }

    try {
      if (profileId) {
        await api.patch(`/perfis de usuarios/${profileId}/`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        const response = await api.post('/perfis de usuarios/', formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setProfileId(response.data.id);
        
        // Se for criado agora, busca o nome atualizado do servidor
        carregarPerfil(); 
      }
      Alert.alert("Sucesso!", "Perfil salvo com sucesso.");
    } catch (error: any) {
      console.error("Erro ao salvar perfil:", error);
      Alert.alert("Erro", "Não foi possível salvar o perfil.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>Sem Foto</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.changePhotoText} onPress={pickImage}>Toque para alterar a foto</Text>
        
        {/* NOME DE USUÁRIO EXIBIDO AQUI */}
        {username ? <Text style={styles.usernameText}>@{username}</Text> : null}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.statsText}>Jogos Adicionados: {gamesAdded}</Text>
      </View>

      <Text style={styles.label}>País</Text>
      <TextInput 
        style={styles.input} 
        value={country} 
        onChangeText={setCountry} 
        placeholder="De onde você é?"
      />

      <Text style={styles.label}>Biografia</Text>
      <TextInput 
        style={[styles.input, styles.textArea]} 
        value={bio} 
        onChangeText={setBio} 
        placeholder="Fale um pouco sobre você e seus jogos favoritos..."
        multiline={true}
      />

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Salvar Perfil</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#f4f7f6', alignItems: 'center' },
  
  header: { alignItems: 'center', marginBottom: 20, marginTop: 10 },
  avatarContainer: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 2, borderColor: '#007BFF' },
  avatar: { width: '100%', height: '100%' },
  avatarPlaceholder: { justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#777', fontWeight: 'bold' },
  changePhotoText: { color: '#007BFF', marginTop: 10, fontSize: 14, fontWeight: '600' },
  
  // Estilo para o Nome de Usuário
  usernameText: { fontSize: 20, fontWeight: 'bold', color: '#333', marginTop: 15 },
  
  infoBox: { backgroundColor: '#e9ecef', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 25 },
  statsText: { fontSize: 16, fontWeight: 'bold', color: '#333' },

  label: { alignSelf: 'flex-start', fontSize: 14, fontWeight: 'bold', color: '#444', marginBottom: 5, marginLeft: 5 },
  input: { width: '100%', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 20 },
  textArea: { height: 100, textAlignVertical: 'top' },

  saveButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});