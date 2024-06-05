import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const NowPlaying = ({ title, artist, duration }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Now Playing</Text>
      <View style={styles.playingContainer}>
        <View style={styles.albumArt}></View>
        <View style={styles.detailsContainer}>
          <Text style={styles.songTitle}>{title}</Text>
          <Text style={styles.artist}>{artist}</Text>
        </View>
        <Text style={styles.duration}>{duration}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  playingContainer: {
    width: 310,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 10, // Adjusted marginTop for space
    borderRadius: 12,
    backgroundColor: 'rgba(247, 250, 252, 1)',
    borderWidth: 1,
    borderColor: 'rgba(209, 214, 232, 1)',
    paddingVertical: 10, // Added paddingVertical for space
  },
  albumArt: {
    width: 57,
    height: 57,
    borderRadius: 12,
    backgroundColor: 'rgba(158, 171, 184, 1)',
    marginRight: 16,
  },
  detailsContainer: {
    flex: 1,
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  artist: {
    fontSize: 12,
    fontWeight: '400',
    marginTop: 5,
  },
  duration: {
    textAlign: 'right',
  },
});

export default NowPlaying;
