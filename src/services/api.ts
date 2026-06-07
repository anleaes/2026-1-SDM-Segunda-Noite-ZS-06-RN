import axios from "axios";
import { Platform } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

const api = axios.create({
  baseURL: "http://localhost:8000",
  withCredentials: true,
});

// Interceptor: Roda ANTES de qualquer requisição sair do app
api.interceptors.request.use(async (config) => {
  
  // 1. Pega o Token do cofre do celular
  const token = await AsyncStorage.getItem('userToken');
  
  // 2. Se o Token existir, carimba ele no cabeçalho de autorização padrão do Django
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  // 3. Mantém a regra do CSRF para quando rodar no navegador
  if (Platform.OS === 'web') {
    const match = document.cookie.match(new RegExp('(^| )csrftoken=([^;]+)'));
    if (match) {
      config.headers['X-CSRFToken'] = match[2];
    }
  }
  
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;