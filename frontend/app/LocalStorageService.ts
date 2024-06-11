import AsyncStorage from '@react-native-async-storage/async-storage';

class LocalStorageService {
  async setToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem('token', token);
    } catch (error) {
      console.error('Error saving token to local storage:', error);
      throw error; // Re-throw the error to handle it in the calling code
    }
  }

  async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem('token');
      return token;
    } catch (error) {
      console.error('Error getting token from local storage:', error);
      throw error; // Re-throw the error to handle it in the calling code
    }
  }
}

export default new LocalStorageService();
