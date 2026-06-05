import React, { useState, useEffect } from 'react';
import { Text, TextInput, StyleSheet, ScrollView, View, TouchableOpacity, Image } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import api from '../src/services/api';

export default function GameCreateScreen() {
  // 1. Estados Básicos do Jogo
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [averageRating, setAverageRating] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);

  // 2. Estados das Listas (para os Pickers)
  const [developers, setDevelopers] = useState([]);
  const [genres, setGenres] = useState([]);
  const [consoles, setConsoles] = useState([]);

  // 3. Estados das Seleções Atuais
  const [developer, setDeveloper] = useState("");
  const [genre, setGenre] = useState("");
  const [consoleId, setConsoleId] = useState("");

  useEffect(() => {
    api.get("/developer/").then((response) => setDevelopers(response.data)).catch(console.error);
    api.get("/genre/").then((response) => setGenres(response.data)).catch(console.error);
    api.get("/console/").then((response) => setConsoles(response.data)).catch(console.error);
  }, []);

  // 4. Função nativa para abrir a galeria e escolher a imagem
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, // Permite cortar a foto antes de salvar
      aspect: [3, 4], // Proporção parecida com uma capa de jogo física
      quality: 1,
    });

    if (!result.canceled) {
      setCoverImage(result.assets[0].uri);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Novo Jogo</Text>

      <Text style={styles.label}>Título</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        multiline={true}
        numberOfLines={4}
      />

      <Text style={styles.label}>Ano de Lançamento</Text>
      <TextInput style={styles.input} value={releaseYear} onChangeText={setReleaseYear} keyboardType="numeric" />

      <Text style={styles.label}>Nota Média</Text>
      <TextInput style={styles.input} value={averageRating} onChangeText={setAverageRating} keyboardType="numeric" />

      {/* --- PARTE 2: IMAGEM E MENUS SUSPENSOS --- */}

      <Text style={styles.label}>Capa do Jogo</Text>
      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.imageButtonText}>Escolher Imagem da Galeria</Text>
      </TouchableOpacity>
      {/* Se o usuário escolheu uma imagem, nós mostramos um preview na tela */}
      {coverImage && <Image source={{ uri: coverImage }} style={styles.previewImage} />}

      <Text style={styles.label}>Desenvolvedora</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={developer} onValueChange={(itemValue) => setDeveloper(itemValue)}>
          <Picker.Item label="Selecione uma desenvolvedora" value="" />
          {developers.map((dev: any) => (
            <Picker.Item key={dev.id} label={dev.name} value={dev.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Gênero</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={genre} onValueChange={(itemValue) => setGenre(itemValue)}>
          <Picker.Item label="Selecione um gênero" value="" />
          {genres.map((gen: any) => (
            <Picker.Item key={gen.id} label={gen.name} value={gen.id} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Console</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={consoleId} onValueChange={(itemValue) => setConsoleId(itemValue)}>
          <Picker.Item label="Selecione um console" value="" />
          {consoles.map((con: any) => (
            <Picker.Item key={con.id} label={con.name} value={con.id} />
          ))}
        </Picker>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1, paddingBottom: 50 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '600', marginTop: 15, marginBottom: 5, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  textArea: { height: 100, textAlignVertical: 'top' },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#f9f9f9', overflow: 'hidden' },
  imageButton: { backgroundColor: '#4B7BE5', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  imageButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  previewImage: { width: 100, height: 140, borderRadius: 8, marginTop: 15, alignSelf: 'center' }
});