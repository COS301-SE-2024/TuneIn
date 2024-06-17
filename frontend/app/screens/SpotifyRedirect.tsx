import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import * as Linking from 'expo-linking';

const SpotifyRedirect = () => {
  const router = useRouter();
  const [tokenDetails, setTokenDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const extractToken = async () => {
      try {
        const url = await Linking.getInitialURL();
        if (url) {
          console.log('Redirect URL:', url);
          const hash = url.split('#')[1];
          const params = new URLSearchParams(hash);
          const accessToken = params.get('access_token');
          const tokenType = params.get('token_type');
          const expiresIn = params.get('expires_in');

          if (accessToken) {
            console.log('Access Token:', accessToken);
            console.log('Token Type:', tokenType);
            console.log('Expires In:', expiresIn);

            setTokenDetails({
              accessToken,
              tokenType,
              expiresIn,
            });

            // Optionally navigate to another screen and pass the token
            router.push({
              pathname: '/screens/Home',
              params: { accessToken },
            });
          } else {
            setError('Access token not found');
            console.error('Access token not found');
          }
        } else {
          setError('URL not found');
          console.error('URL not found');
        }
      } catch (err) {
        setError('An error occurred while extracting the token');
        console.error('An error occurred while extracting the token', err);
      }
    };

    extractToken();
  }, [router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      {tokenDetails ? (
        <View>
          <Text>Access Token: {tokenDetails.accessToken}</Text>
          <Text>Token Type: {tokenDetails.tokenType}</Text>
          <Text>Expires In: {tokenDetails.expiresIn}</Text>
        </View>
      ) : error ? (
        <Text>Error: {error}</Text>
      ) : (
        <View>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text>Authenticating...</Text>
        </View>
      )}
    </View>
  );
};

export default SpotifyRedirect;
