import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/Keys';
import { UsuarioResponse } from '../types/user';

// Chave segura sanitizada para iOS Keychain e Android Keystore
const SECURE_TOKEN_KEY = 'petguardian_auth_token';

/**
 * StorageService — Fachada centralizada de persistência do aplicativo.
 * - Dados sensíveis (Token JWT): Persistidos no hardware seguro via Expo Secure Store (com fallback Web).
 * - Dados de estado e cache (Usuário, Pet Ativo, Preferências): Persistidos no AsyncStorage.
 */
export const StorageService = {
  /**
   * Salva o Token JWT de autenticação de forma segura.
   */
  async saveToken(token: string): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
      } else {
        await SecureStore.setItemAsync(SECURE_TOKEN_KEY, token);
      }
    } catch {
      // Fallback de segurança caso SecureStore falhe no ambiente
      await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    }
  },

  /**
   * Recupera o Token JWT de autenticação seguro.
   */
  async getToken(): Promise<string | null> {
    try {
      if (Platform.OS === 'web') {
        return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      }
      const secureToken = await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
      if (secureToken) return secureToken;

      // Fallback / Migração de versão anterior do AsyncStorage
      const legacyToken = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
      if (legacyToken) {
        await SecureStore.setItemAsync(SECURE_TOKEN_KEY, legacyToken);
        await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
        return legacyToken;
      }
      return null;
    } catch {
      return await AsyncStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    }
  },

  /**
   * Remove o Token JWT de autenticação.
   */
  async removeToken(): Promise<void> {
    try {
      if (Platform.OS !== 'web') {
        await SecureStore.deleteItemAsync(SECURE_TOKEN_KEY);
      }
    } catch {
      // Ignora erro no delete se chave não existir
    }
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
  },

  /**
   * Salva o objeto do usuário autenticado no AsyncStorage.
   */
  async saveUser(user: UsuarioResponse): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
  },

  /**
   * Recupera o objeto do usuário autenticado do AsyncStorage.
   */
  async getUser(): Promise<UsuarioResponse | null> {
    const userStr = await AsyncStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr) as UsuarioResponse;
    } catch {
      return null;
    }
  },

  /**
   * Remove o objeto do usuário do AsyncStorage.
   */
  async removeUser(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  },

  /**
   * Define o ID do Pet ativo selecionado na aplicação.
   */
  async setActivePetId(petId: number): Promise<void> {
    await AsyncStorage.setItem(STORAGE_KEYS.ACTIVE_PET_ID, String(petId));
  },

  /**
   * Recupera o ID do Pet ativo selecionado.
   */
  async getActivePetId(): Promise<number | null> {
    const idStr = await AsyncStorage.getItem(STORAGE_KEYS.ACTIVE_PET_ID);
    if (!idStr) return null;
    const num = Number(idStr);
    return isNaN(num) ? null : num;
  },

  /**
   * Limpa todos os dados da sessão (Token Seguro, Usuário, Flags e Pet Ativo) no Logout.
   */
  async clearAuthSession(): Promise<void> {
    await this.removeToken();
    await this.removeUser();
    await AsyncStorage.removeItem(STORAGE_KEYS.LOGADO);
    await AsyncStorage.removeItem(STORAGE_KEYS.ACTIVE_PET_ID);
  },
};
