import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput } from 'react-native';

export default function ProfileScreen() {
  // Estados que vão receber os dados do seu banco
  const [avatar, setAvatar] = useState<string | null>(null);
  const [bio, setBio] = useState("");
  const [country, setCountry] = useState("");
  const [gamesAdded, setGamesAdded] = useState(0);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      
      {/* Seção do Avatar */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.avatarContainer}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>Sem Foto</Text>
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.changePhotoText}>Toque para alterar a foto</Text>
      </View>

      {/* Seção de Informações */}
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

      <TouchableOpacity style={styles.saveButton}>
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
  
  infoBox: { backgroundColor: '#e9ecef', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 25 },
  statsText: { fontSize: 16, fontWeight: 'bold', color: '#333' },

  label: { alignSelf: 'flex-start', fontSize: 14, fontWeight: 'bold', color: '#444', marginBottom: 5, marginLeft: 5 },
  input: { width: '100%', backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 20 },
  textArea: { height: 100, textAlignVertical: 'top' },

  saveButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});