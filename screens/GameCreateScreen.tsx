import React, { useState, useEffect } from 'react';
import { Text, TextInput, StyleSheet, ScrollView, View, TouchableOpacity, Image, Alert, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import api from '../src/services/api';

interface Developer { id: number; name: string; }
interface Genre { id: number; name: string; }
interface ConsoleItem { id: number; name: string; }

export default function GameCreateScreen() {
  const navigation = useNavigation();

  // --- ESTADOS BÁSICOS ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [averageRating, setAverageRating] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);

  // --- ESTADOS DAS LISTAS ---
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [consoles, setConsoles] = useState<ConsoleItem[]>([]);

  const [developer, setDeveloper] = useState("");
  const [genre, setGenre] = useState("");
  const [consoleId, setConsoleId] = useState("");

  // --- ESTADOS DOS FORMULÁRIOS DINÂMICOS ---
  const [showDevForm, setShowDevForm] = useState(false);
  const [showGenreForm, setShowGenreForm] = useState(false);
  const [showConsoleForm, setShowConsoleForm] = useState(false);

  const [newDevName, setNewDevName] = useState("");
  const [newDevCountry, setNewDevCountry] = useState("");
  const [newDevYear, setNewDevYear] = useState("");
  const [newDevDesc, setNewDevDesc] = useState("");

  const [newGenreName, setNewGenreName] = useState("");
  const [newGenreDesc, setNewGenreDesc] = useState("");

  const [newConsoleName, setNewConsoleName] = useState("");
  const [newConsoleManufacturer, setNewConsoleManufacturer] = useState("");
  const [newConsoleYear, setNewConsoleYear] = useState("");

  useEffect(() => {
    api.get("/developer/").then((response) => setDevelopers(response.data)).catch(console.error);
    api.get("/genre/").then((response) => setGenres(response.data)).catch(console.error);
    api.get("/console/").then((response) => setConsoles(response.data)).catch(console.error);
  }, []);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 1,
    });
    if (!result.canceled) setCoverImage(result.assets[0].uri);
  };

  // --- LÓGICA DE FORMATAÇÃO E VALIDAÇÃO ---
  const handleYearChange = (text: string) => {
    // Permite apenas números
    const numericValue = text.replace(/[^0-9]/g, '');
    setReleaseYear(numericValue);
  };

  const handleRatingChange = (text: string) => {
    // Remove tudo que não for número
    let cleaned = text.replace(/[^0-9]/g, '');
    
    if (cleaned === '') {
      setAverageRating('');
      return;
    }

    let num = parseInt(cleaned, 10);
    if (num > 100) num = 100; // Trava o máximo em 10.0 (100)

    if (num === 100) {
      setAverageRating('10.0');
    } else if (cleaned.length >= 2) {
      // Ex: digitou 85 -> vira 8.5
      let firstPart = cleaned.substring(0, cleaned.length - 1);
      let lastPart = cleaned.substring(cleaned.length - 1);
      setAverageRating(`${firstPart}.${lastPart}`);
    } else {
      setAverageRating(cleaned);
    }
  };

  const incrementRating = () => {
    let current = parseFloat(averageRating) || 0;
    if (current < 10) setAverageRating((current + 0.1).toFixed(1));
  };

  const decrementRating = () => {
    let current = parseFloat(averageRating) || 0;
    if (current > 0) setAverageRating((current - 0.1).toFixed(1));
  };

  // --- FUNÇÕES DE CRIAÇÃO DINÂMICA ---
  const createDeveloper = async () => {
    try {
      const response = await api.post("/developer/", { name: newDevName, country: newDevCountry, foundation_year: Number(newDevYear), description: newDevDesc });
      const createdDev = response.data;
      setDevelopers([...developers, createdDev]);
      setDeveloper(createdDev.id);
      setShowDevForm(false);
      setNewDevName(""); setNewDevCountry(""); setNewDevYear(""); setNewDevDesc("");
      Alert.alert("Sucesso", "Desenvolvedora criada!");
    } catch (error) {
      Alert.alert("Erro", "Falha ao criar desenvolvedora.");
    }
  };

  const createGenre = async () => {
    try {
      const response = await api.post("/genre/", { name: newGenreName, description: newGenreDesc });
      const createdGenre = response.data;
      setGenres([...genres, createdGenre]);
      setGenre(createdGenre.id);
      setShowGenreForm(false);
      setNewGenreName(""); setNewGenreDesc("");
      Alert.alert("Sucesso", "Gênero criado!");
    } catch (error) {
      Alert.alert("Erro", "Falha ao criar gênero.");
    }
  };

  const createConsole = async () => {
    try {
      const response = await api.post("/console/", { name: newConsoleName, manufacturer: newConsoleManufacturer, release_year: Number(newConsoleYear) });
      const createdConsole = response.data;
      setConsoles([...consoles, createdConsole]);
      setConsoleId(createdConsole.id);
      setShowConsoleForm(false);
      setNewConsoleName(""); setNewConsoleManufacturer(""); setNewConsoleYear("");
      Alert.alert("Sucesso", "Console criado!");
    } catch (error) {
      Alert.alert("Erro", "Falha ao criar console.");
    }
  };

  const handleSubmit = async () => {
    // Validação de preenchimento
    if (!title || !developer || !genre || !consoleId) {
      Alert.alert("Atenção", "Preencha o título, desenvolvedora, gênero e console!");
      return;
    }

    // Validação de Ano Sensato
    if (releaseYear) {
      const yearNum = parseInt(releaseYear, 10);
      const currentYear = new Date().getFullYear();
      if (yearNum < 1950 || yearNum > currentYear + 5) {
        Alert.alert("Atenção", "Por favor, insira um ano de lançamento válido.");
        return;
      }
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("release_year", releaseYear);
    formData.append("developer", developer);
    formData.append("genre", genre);
    formData.append("consoles", consoleId); 

    // Formatação do zero absoluto
    let finalRating = averageRating;
    if (finalRating === "0" || finalRating === "0.") finalRating = "0.0";
    if (finalRating !== "") formData.append("average_rating", finalRating);

    if (coverImage) {
      if (Platform.OS === 'web') {
        const response = await fetch(coverImage);
        const blob = await response.blob();
        formData.append("cover_image", blob, "capa.jpg");
      } else {
        const filename = coverImage.split('/').pop() || 'capa.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;
        formData.append("cover_image", { uri: coverImage, name: filename, type: type } as any);
      }
    }

    try {
      await api.post("/jogos/", formData, { headers: { "Content-Type": "multipart/form-data" } });
      Alert.alert("Sucesso!", "Jogo cadastrado na biblioteca!");
      
      setTitle(""); setDescription(""); setReleaseYear(""); setAverageRating("");
      setDeveloper(""); setGenre(""); setConsoleId(""); setCoverImage(null);
      
      navigation.navigate("Games" as never);
    } catch (error: any) {
      if (error.response && error.response.data) console.error("Erro do Django:", error.response.data);
      Alert.alert("Erro", "O Django recusou os dados. Verifique o console (F12).");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Novo Jogo</Text>

      <Text style={styles.label}>Título</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Descrição</Text>
      <TextInput style={[styles.input, styles.textArea]} value={description} onChangeText={setDescription} multiline={true} numberOfLines={4} />

      <Text style={styles.label}>Ano de Lançamento</Text>
      <TextInput 
        style={styles.input} 
        value={releaseYear} 
        onChangeText={handleYearChange} 
        keyboardType="numeric" 
        maxLength={4} // Trava em 4 dígitos
      />

      <Text style={styles.label}>Avaliação</Text>
      <View style={styles.ratingContainer}>
        <TouchableOpacity style={styles.ratingButton} onPress={decrementRating}>
          <Text style={styles.ratingButtonText}>-</Text>
        </TouchableOpacity>
        
        <TextInput 
          style={styles.ratingInput} 
          value={averageRating} 
          onChangeText={handleRatingChange} 
          keyboardType="numeric" 
          maxLength={4}
          placeholder="0.0"
        />
        
        <TouchableOpacity style={styles.ratingButton} onPress={incrementRating}>
          <Text style={styles.ratingButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Capa do Jogo</Text>
      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.imageButtonText}>Escolher Imagem</Text>
      </TouchableOpacity>
      {coverImage && <Image source={{ uri: coverImage }} style={styles.previewImage} />}

      {/* SEÇÃO: DESENVOLVEDORA */}
      <Text style={styles.label}>Desenvolvedora</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={developer} onValueChange={setDeveloper}>
          <Picker.Item label="Selecione uma desenvolvedora" value="" />
          {developers.map((dev: any) => (<Picker.Item key={dev.id} label={dev.name} value={dev.id} />))}
        </Picker>
      </View>
      <TouchableOpacity style={styles.newLinkContainer} onPress={() => setShowDevForm(!showDevForm)}>
        <Text style={styles.newLink}>+ Nova Desenvolvedora</Text>
      </TouchableOpacity>
      
      {showDevForm && (
        <View style={styles.dynamicForm}>
          <TextInput style={styles.inputDynamic} placeholder="Nome" value={newDevName} onChangeText={setNewDevName} />
          <TextInput style={styles.inputDynamic} placeholder="País" value={newDevCountry} onChangeText={setNewDevCountry} />
          <TextInput style={styles.inputDynamic} placeholder="Ano de Fundação" value={newDevYear} onChangeText={setNewDevYear} keyboardType="numeric" />
          <TextInput style={styles.inputDynamic} placeholder="Descrição" value={newDevDesc} onChangeText={setNewDevDesc} />
          <TouchableOpacity style={styles.saveDynamicButton} onPress={createDeveloper}>
            <Text style={styles.saveDynamicText}>Salvar Desenvolvedora</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SEÇÃO: GÊNERO */}
      <Text style={styles.label}>Gênero</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={genre} onValueChange={setGenre}>
          <Picker.Item label="Selecione um gênero" value="" />
          {genres.map((gen: any) => (<Picker.Item key={gen.id} label={gen.name} value={gen.id} />))}
        </Picker>
      </View>
      <TouchableOpacity style={styles.newLinkContainer} onPress={() => setShowGenreForm(!showGenreForm)}>
        <Text style={styles.newLink}>+ Novo Gênero</Text>
      </TouchableOpacity>

      {showGenreForm && (
        <View style={styles.dynamicForm}>
          <TextInput style={styles.inputDynamic} placeholder="Nome do Gênero" value={newGenreName} onChangeText={setNewGenreName} />
          <TextInput style={styles.inputDynamic} placeholder="Descrição" value={newGenreDesc} onChangeText={setNewGenreDesc} />
          <TouchableOpacity style={styles.saveDynamicButton} onPress={createGenre}>
            <Text style={styles.saveDynamicText}>Salvar Gênero</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SEÇÃO: CONSOLE */}
      <Text style={styles.label}>Console</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={consoleId} onValueChange={setConsoleId}>
          <Picker.Item label="Selecione um console" value="" />
          {consoles.map((con: any) => (<Picker.Item key={con.id} label={con.name} value={con.id} />))}
        </Picker>
      </View>
      <TouchableOpacity style={styles.newLinkContainer} onPress={() => setShowConsoleForm(!showConsoleForm)}>
        <Text style={styles.newLink}>+ Novo Console</Text>
      </TouchableOpacity>

      {showConsoleForm && (
        <View style={styles.dynamicForm}>
          <TextInput style={styles.inputDynamic} placeholder="Nome do Console" value={newConsoleName} onChangeText={setNewConsoleName} />
          <TextInput style={styles.inputDynamic} placeholder="Fabricante" value={newConsoleManufacturer} onChangeText={setNewConsoleManufacturer} />
          <TextInput style={styles.inputDynamic} placeholder="Ano de Lançamento" value={newConsoleYear} onChangeText={setNewConsoleYear} keyboardType="numeric" />
          <TouchableOpacity style={styles.saveDynamicButton} onPress={createConsole}>
            <Text style={styles.saveDynamicText}>Salvar Console</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.mainSubmitButton} onPress={handleSubmit}>
        <Text style={styles.mainSubmitText}>Salvar Novo Jogo</Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

// --- ESTILOS VISUAIS ---
const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flexGrow: 1, paddingBottom: 50 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '600', marginTop: 15, marginBottom: 5, color: '#333' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, fontSize: 16, backgroundColor: '#f9f9f9' },
  textArea: { height: 100, textAlignVertical: 'top' },
  pickerContainer: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, backgroundColor: '#f9f9f9', overflow: 'hidden' },
  imageButton: { backgroundColor: '#4B7BE5', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  imageButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  previewImage: { width: 100, height: 140, borderRadius: 8, marginTop: 15, alignSelf: 'center' },
  
  // Estilos da Avaliação
  ratingContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 5 },
  ratingButton: { backgroundColor: '#4B7BE5', width: 45, height: 45, justifyContent: 'center', alignItems: 'center', borderRadius: 8 },
  ratingButtonText: { color: '#fff', fontSize: 24, fontWeight: 'bold', lineHeight: 28 },
  ratingInput: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, fontSize: 18, backgroundColor: '#f9f9f9', flex: 1, marginHorizontal: 10, textAlign: 'center' },

  // Estilos dos Formulários Dinâmicos
  newLinkContainer: { alignSelf: 'flex-end', marginTop: 8, paddingVertical: 5 },
  newLink: { color: '#007BFF', fontWeight: 'bold', fontSize: 14 },
  dynamicForm: { backgroundColor: '#f0f4ff', padding: 15, borderRadius: 8, marginTop: 10, borderWidth: 1, borderColor: '#d0dcf2' },
  inputDynamic: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginBottom: 10 },
  saveDynamicButton: { backgroundColor: '#28a745', padding: 10, borderRadius: 6, alignItems: 'center' },
  saveDynamicText: { color: '#fff', fontWeight: 'bold' },

  mainSubmitButton: { backgroundColor: '#007BFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30, marginBottom: 20 },
  mainSubmitText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});