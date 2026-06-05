import axios from "axios";
import { Platform } from "react-native";

const api = axios.create({
    baseURL: "http://localhost:8000",
    withCredentials: true,

    //xsrfCookieName: 'csrftoken',
    //xsrfHeaderName: 'X-CSRFToken',
});


// Interceptor: Ele intercepta a requisição antes de sair e injeta o token à força.
api.interceptors.request.use((config) => {
  // O Platform.OS garante que isso só rode no navegador, evitando erros no celular
  if (Platform.OS === 'web') {
    const match = document.cookie.match(new RegExp('(^| )csrftoken=([^;]+)'));
    if (match) {
      // Injeta o cabeçalho exato que o Django exige
      config.headers['X-CSRFToken'] = match[2];
    }
  }
  return config;
});


export default api;