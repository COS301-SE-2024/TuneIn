import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const clientId = process.env.VITE_SPOTIFY_CLIENT_ID;
const clientSecret = process.env.VITE_SPOTIFY_CLIENT_SECRET;

export const useSpotifyAuth = () => {
  const [accessToken, setAccessToken] = useState<string>('');
  const [refreshToken, setRefreshToken] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const storedRefreshToken = await AsyncStorage.getItem('refresh_token');
      if (token) {
        setAccessToken(token);
        await refreshAccessTokenIfNeeded(token);
      }
      if (storedRefreshToken) {
        setRefreshToken(storedRefreshToken);
      }
    } catch (err) {
      setError('An error occurred while fetching data');
      console.error('An error occurred while fetching data', err);
    }
  };

  const handleTokenChange = async (token: string) => {
    try {
      setAccessToken(token);
      await AsyncStorage.setItem('access_token', token);
    } catch (err) {
      setError('An error occurred while saving token');
      console.error('An error occurred while saving token', err);
    }
  };

  const handleRefreshTokenChange = async (token: string) => {
    try {
      setRefreshToken(token);
      await AsyncStorage.setItem('refresh_token', token);
    } catch (err) {
      setError('An error occurred while saving refresh token');
      console.error('An error occurred while saving refresh token', err);
    }
  };

  const getRefreshToken = async (): Promise<void> => {
    try {
      const storedRefreshToken = await AsyncStorage.getItem('refresh_token');
      if (!storedRefreshToken) throw new Error('No refresh token found');
      const response = await axios.post('http://192.168.56.1:4000/refresh_token', {
        refresh_token: refreshToken,
      });

      if (!response) throw new Error('Failed to refresh token');

      const data = await response.data;
      await AsyncStorage.setItem('access_token', data.access_token);
      setAccessToken(data.access_token);
    } catch (err) {
      setError('An error occurred while refreshing token');
      console.error('An error occurred while refreshing token', err);
    }
  };

  const refreshAccessTokenIfNeeded = async (token: string) => {
    // Placeholder function to check if token is expired
    const isTokenExpired = false; // Replace with actual expiration check logic

    if (isTokenExpired) {
      await getRefreshToken();
    }
  };

  return {
    accessToken,
    refreshToken,
    error,
    handleTokenChange,
    handleRefreshTokenChange,
    getRefreshToken,
  };
};
