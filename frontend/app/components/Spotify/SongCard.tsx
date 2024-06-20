import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const SongCard = ({ track, onPlay }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{track.name}</Text>
      <Text style={styles.artist}>{track.artists[0].name}</Text>
      <Button title="Play" onPress={onPlay} />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 10,
    margin: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  artist: {
    fontSize: 16,
    color: '#666',
  },
});

export default SongCard;
