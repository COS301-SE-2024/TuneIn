import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useSpotifyAuth } from './useSpotifyAuth';

export const useSpotifyDevices = () => {
  const { getToken } = useSpotifyAuth();
  const [accessToken, setAccessToken] = useState<string>('');
  const [devices, setDevices] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const token = await getToken();
        setAccessToken(token);
      } catch (err) {
        setError('An error occurred while fetching the token');
        console.error('An error occurred while fetching the token', err);
      }
    };

    fetchToken();
  }, [getToken]);

  useEffect(() => {
    if (accessToken) {
      getDevices(accessToken);
    }
  }, [accessToken]);

  const getDevices = async (token: string) => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
  
      setDevices(data.devices);
    } catch (err) {
      setError('An error occurred while fetching devices');
      console.error('An error occurred while fetching devices', err);
    }
  };

  const getFirstDevice = async (): Promise<string | null> => {
    try {
      if (devices.length > 0) {
        return devices[0].id; // Return the ID of the first device
      } else {
        Alert.alert('No Devices Found', 'No devices are currently active.');
        return null;
      }
    } catch (err) {
      setError('An error occurred while getting the device ID');
      console.error('An error occurred while getting the device ID', err);
      return null;
    }
  };

  const getDeviceIDs = async () => {
    try {
      const response = await fetch('https://api.spotify.com/v1/me/player/devices', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      
      return data.devices ;
    } catch (err) {
      setError('An error occurred while fetching devices');
      console.error('An error occurred while fetching devices', err);
    }
  };

  return {
    devices,
    getFirstDevice,
    getDeviceIDs,
    error,
  };
};
