import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';

const SpotifyLoginScreen: React.FC = () => {
  const handleLogin = () => {
    // Handle login logic
  };

  return (
    <LinearGradient
      colors={['#000000', '#000000']}
      style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
    >
      <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: 'rgba(255, 255, 255, 0.2)', alignItems: 'center', justifyContent: 'center' }}>
        <Image
          source={require('../assets/spotify.svg')}
          style={{ width: 80, height: 80 }}
        />
      </View>
      <TouchableOpacity
        style={{ marginTop: 20, backgroundColor: '#1DB954', borderRadius: 20, padding: 16 }}
        onPress={handleLogin}
      >
        <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' }}>Login with Spotify</Text>
      </TouchableOpacity>
    </LinearGradient>
  );
};

export default SpotifyLoginScreen;
