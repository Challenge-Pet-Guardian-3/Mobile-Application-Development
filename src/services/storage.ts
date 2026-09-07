import * as SecureStore from 'expo-secure-store';

const SECURE_TOKEN_KEY = 'petguardian_auth_token';
const SECURE_USER_EMAIL_KEY = 'petguardian_user_email';

export const StorageService = {
  async saveAuth(token: string, email: string): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(SECURE_TOKEN_KEY, token),
      SecureStore.setItemAsync(SECURE_USER_EMAIL_KEY, email),
    ]);
  },

  async getToken(): Promise<string | null> {
    return await SecureStore.getItemAsync(SECURE_TOKEN_KEY);
  },

  async getEmail(): Promise<string | null> {
    return await SecureStore.getItemAsync(SECURE_USER_EMAIL_KEY);
  },

  async clearAuthSession(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(SECURE_TOKEN_KEY),
      SecureStore.deleteItemAsync(SECURE_USER_EMAIL_KEY),
    ]);
  },
};
