import { useState, useEffect } from 'react';
import { Alert } from 'react-native';

export const useSpotifyDevices = (accessToken: string) => {
  const [devices, setDevices] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  const getDeviceId = async (): Promise<string | null> => {
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

  return {
    devices,
    getDeviceId,
    error,
  };
};
