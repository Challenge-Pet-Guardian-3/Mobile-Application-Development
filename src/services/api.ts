import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/Keys';

export const api = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Requisição: Anexa o Token Bearer com validação estrita
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      
      // Valida se o token é uma string real e não vazia antes de anexar
      if (
        token && 
        typeof token === 'string' && 
        token.trim() !== '' && 
        token !== 'null' && 
        token !== 'undefined'
      ) {
        config.headers.Authorization = `Bearer ${token.trim()}`;
      } else {
        delete config.headers.Authorization;
      }
    } catch (error) {
      console.error('Erro ao recuperar token do armazenamento:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);