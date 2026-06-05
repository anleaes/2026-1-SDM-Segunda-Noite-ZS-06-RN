import React, { useState, useEffect } from 'react';
import { Text, TextInput, StyleSheet, ScrollView, View, TouchableOpacity, Image, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import api from '../src/services/api';
import { useNavigation } from '@react-navigation/native';

interface Developer {
  id: number;
  name: string;
}

interface Genre {
  id: number;
  name: string;
}

interface ConsoleItem {
  id: number;
  name: string;
}

export default function GameCreateScreen() {
  // 1. Estados Básicos do Jogo
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [releaseYear, setReleaseYear] = useState("");
  const [averageRating, setAverageRating] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);

  // 2. Estados das Listas (Pickers) e Seleções Atuais
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [consoles, setConsoles] = useState<ConsoleItem[]>([]);

  const [developer, setDeveloper] = useState("");
  const [genre, setGenre] = useState("");
  const [consoleId, setConsoleId] = useState("");

  // 3. Estados para os Novos Cadastros (Exibição dos Formulários)
  const [showDevForm, setShowDevForm] = useState(false);
  const [showGenreForm, setShowGenreForm] = useState(false);
  const [showConsoleForm, setShowConsoleForm] = useState(false);

  // Estados dos inputs de Nova Desenvolvedora
  const [newDevName, setNewDevName] = useState("");
  const [newDevCountry, setNewDevCountry] = useState("");
  const [newDevYear, setNewDevYear] = useState("");
  const [newDevDesc, setNewDevDesc] = useState("");

  // Estados dos inputs de Novo Gênero
  const [newGenreName, setNewGenreName] = useState("");
  const [newGenreDesc, setNewGenreDesc] = useState("");

  // Estados dos inputs de Novo Console
  const [newConsoleName, setNewConsoleName] = useState("");

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

    if (!result.canceled) {
      setCoverImage(result.assets[0].uri);
    }
  };

  // --- FUNÇÕES DE CRIAÇÃO DINÂMICA ---

  const createDeveloper = async () => {
    try {
      const response = await api.post("/developer/", {
        name: newDevName,
        country: newDevCountry,
        foundation_year: Number(newDevYear),
        description: newDevDesc
      });
      const createdDev = response.data;
      setDevelopers([...developers, createdDev]);
      setDeveloper(createdDev.id); // Já seleciona a nova dev no Picker
      setShowDevForm(false);
      // Limpa os campos
      setNewDevName(""); setNewDevCountry(""); setNewDevYear(""); setNewDevDesc("");
      Alert.alert("Sucesso", "Desenvolvedora criada!");
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao criar desenvolvedora.");
    }
  };

  const createGenre = async () => {
    try {
      const response = await api.post("/genre/", {
        name: newGenreName,
        description: newGenreDesc
      });
      const createdGenre = response.data;
      setGenres([...genres, createdGenre]);
      setGenre(createdGenre.id);
      setShowGenreForm(false);
      setNewGenreName(""); setNewGenreDesc("");
      Alert.alert("Sucesso", "Gênero criado!");
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao criar gênero.");
    }
  };

  const createConsole = async () => {
    try {
      const response = await api.post("/console/", {
        name: newConsoleName,
      });
      const createdConsole = response.data;
      setConsoles([...consoles, createdConsole]);
      setConsoleId(createdConsole.id);
      setShowConsoleForm(false);
      setNewConsoleName("");
      Alert.alert("Sucesso", "Console criado!");
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Falha ao criar console.");
    }
  };



    const navigation = useNavigation();

  const handleSubmit = async () => {
    // 1. Validação básica
    if (!title || !developer || !genre || !consoleId) {
      Alert.alert("Atenção", "Preencha o título, desenvolvedora, gênero e console!");
      return;
    }

    // 2. Montando os dados
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("release_year", releaseYear);
    formData.append("average_rating", averageRating);
    formData.append("developer", developer);
    formData.append("genre", genre);
    // No seu código Vite era "consoles", então mantemos o plural se for assim no backend:
    formData.append("consoles", consoleId); 

    // 3. Tratamento da Imagem para o Mobile/Expo
    if (coverImage) {
      const filename = coverImage.split('/').pop() || 'capa.jpg';
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image/jpeg`;

      formData.append("cover_image", {
        uri: coverImage,
        name: filename,
        type: type,
      } as any); // "as any" evita erros de tipagem com o FormData nativo
    }

    // 4. Envio para o Backend
    try {
      await api.post("/jogos/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      Alert.alert("Sucesso!", "Jogo cadastrado na biblioteca!");
      
      // Limpa os campos da tela
      setTitle(""); setDescription(""); setReleaseYear(""); setAverageRating("");
      setDeveloper(""); setGenre(""); setConsoleId(""); setCoverImage(null);
      
      // Redireciona para a tela inicial
      navigation.navigate("Games" as never);

    } catch (error: any) {
      console.error("Erro ao salvar jogo:", error);
      Alert.alert("Erro", "Não foi possível salvar o jogo. Verifique o console.");
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
      <TextInput style={styles.input} value={releaseYear} onChangeText={setReleaseYear} keyboardType="numeric" />

      <Text style={styles.label}>Nota Média</Text>
      <TextInput style={styles.input} value={averageRating} onChangeText={setAverageRating} keyboardType="numeric" />

      <Text style={styles.label}>Capa do Jogo</Text>
      <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
        <Text style={styles.imageButtonText}>Escolher Imagem</Text>
      </TouchableOpacity>
      {coverImage && <Image source={{ uri: coverImage }} style={styles.previewImage} />}

      {/* --- SEÇÃO: DESENVOLVEDORA --- */}
      <Text style={styles.label}>Desenvolvedora</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={developer} onValueChange={setDeveloper}>
          <Picker.Item label="Selecione uma desenvolvedora" value="" />
          {developers.map((dev: any) => (<Picker.Item key={dev.id} label={dev.name} value={dev.id} />))}
        </Picker>
      </View>
      <TouchableOpacity onPress={() => setShowDevForm(!showDevForm)}>
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

      {/* --- SEÇÃO: GÊNERO --- */}
      <Text style={styles.label}>Gênero</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={genre} onValueChange={setGenre}>
          <Picker.Item label="Selecione um gênero" value="" />
          {genres.map((gen: any) => (<Picker.Item key={gen.id} label={gen.name} value={gen.id} />))}
        </Picker>
      </View>
      <TouchableOpacity onPress={() => setShowGenreForm(!showGenreForm)}>
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

      {/* --- SEÇÃO: CONSOLE --- */}
      <Text style={styles.label}>Console</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={consoleId} onValueChange={setConsoleId}>
          <Picker.Item label="Selecione um console" value="" />
          {consoles.map((con: any) => (<Picker.Item key={con.id} label={con.name} value={con.id} />))}
        </Picker>
      </View>
      <TouchableOpacity onPress={() => setShowConsoleForm(!showConsoleForm)}>
        <Text style={styles.newLink}>+ Novo Console</Text>
      </TouchableOpacity>

      {showConsoleForm && (
        <View style={styles.dynamicForm}>
          <TextInput style={styles.inputDynamic} placeholder="Nome do Console" value={newConsoleName} onChangeText={setNewConsoleName} />
          <TouchableOpacity style={styles.saveDynamicButton} onPress={createConsole}>
            <Text style={styles.saveDynamicText}>Salvar Console</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* --- BOTÃO FINAL --- */}
      <TouchableOpacity style={styles.mainSubmitButton} onPress={handleSubmit}>
        <Text style={styles.mainSubmitText}>Salvar Novo Jogo</Text>
      </TouchableOpacity>

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
  previewImage: { width: 100, height: 140, borderRadius: 8, marginTop: 15, alignSelf: 'center' },
  
  // Estilos dos Formulários Dinâmicos
  newLink: { color: '#007BFF', marginTop: 8, fontWeight: 'bold', fontSize: 14, alignSelf: 'flex-end' },
  dynamicForm: { backgroundColor: '#f0f4ff', padding: 15, borderRadius: 8, marginTop: 10, borderWidth: 1, borderColor: '#d0dcf2' },
  inputDynamic: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 10, marginBottom: 10 },
  saveDynamicButton: { backgroundColor: '#28a745', padding: 10, borderRadius: 6, alignItems: 'center' },
  saveDynamicText: { color: '#fff', fontWeight: 'bold' },
  mainSubmitButton: { backgroundColor: '#007BFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 30, marginBottom: 20 },
  mainSubmitText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});