import { useState } from 'react';
import { getToken } from './useSpotifyAuth'; // Import the named export

export const useSpotifySearch = () => {
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    try {
      const accessToken = await getToken(); // Get a valid access token

      if (!accessToken) {
        throw new Error('Access token not found');
      }

      const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data.tracks.items);
    } catch (err) {
      setError('An error occurred while searching');
      console.error('An error occurred while searching', err);
    }
  };

  return {
    searchResults,
    handleSearch,
    error,
  };
};
