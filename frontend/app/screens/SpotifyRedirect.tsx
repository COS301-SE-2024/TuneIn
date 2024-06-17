import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Linking from 'expo-linking';

const SpotifyRedirect = () => {
  const [tokenDetails, setTokenDetails] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

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

            // Store token details in local storage
            await AsyncStorage.setItem('accessToken', accessToken);
            await AsyncStorage.setItem('tokenType', tokenType);
            await AsyncStorage.setItem('expiresIn', expiresIn);

            setTokenDetails({
              accessToken,
              tokenType,
              expiresIn,
            });

            setSuccess(true);
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
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {tokenDetails ? (
        <View style={styles.tokenContainer}>
          <Text style={styles.label}>Access Token:</Text>
          <Text style={styles.token}>{tokenDetails.accessToken}</Text>
          <Text style={styles.label}>Token Type:</Text>
          <Text style={styles.token}>{tokenDetails.tokenType}</Text>
          <Text style={styles.label}>Expires In:</Text>
          <Text style={styles.token}>{tokenDetails.expiresIn}</Text>
          {success && <Text style={styles.success}>Token stored successfully in local storage!</Text>}
        </View>
      ) : error ? (
        <Text style={styles.error}>Error: {error}</Text>
      ) : (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0000ff" />
          <Text style={styles.loadingText}>Authenticating...</Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  tokenContainer: {
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
  },
  token: {
    fontSize: 14,
    marginTop: 5,
    marginBottom: 10,
  },
  success: {
    marginTop: 20,
    color: 'green',
    fontWeight: 'bold',
  },
  error: {
    fontSize: 16,
    color: 'red',
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  loadingText: {
    marginTop: 10,
  },
});

export default SpotifyRedirect;
