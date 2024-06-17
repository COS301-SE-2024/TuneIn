// SongCard.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button, Image } from 'react-native';
import { Audio } from 'expo-av';
import Slider from '@react-native-community/slider';

const SongCard = ({ track }) => {
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);

  const playPauseSound = async () => {
    if (!sound) {
      const { sound: newSound } = await Audio.Sound.createAsync({ uri: track.uri });
      setSound(newSound);

      newSound.setOnPlaybackStatusUpdate(updateStatus);
      const status = await newSound.playAsync();
      setDuration(status.durationMillis);
      setIsPlaying(true);
    } else if (isPlaying) {
      await sound.pauseAsync();
      setIsPlaying(false);
    } else {
      await sound.playAsync();
      setIsPlaying(true);
    }
  };

  const updateStatus = (status) => {
    if (status.isLoaded && status.isPlaying) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis);
    } else if (status.didJustFinish) {
      setIsPlaying(false);
    }
  };

  useEffect(() => {
    return sound ? () => { sound.unloadAsync(); } : undefined;
  }, [sound]);

  const onSliderValueChange = async (value) => {
    if (sound) {
      await sound.setPositionAsync(value);
      setPosition(value);
    }
  };

  return (
    <View style={styles.card}>
      <Image source={{ uri: track.album.images[0].url }} style={styles.image} />
      <View style={styles.info}>
        <Text style={styles.title}>{track.name}</Text>
        <Text style={styles.artist}>{track.artists[0].name}</Text>
        <Button title={isPlaying ? "Pause" : "Play"} onPress={playPauseSound} />
        <Slider
          style={styles.slider}
          minimumValue={0}
          maximumValue={duration}
          value={position}
          onValueChange={onSliderValueChange}
          minimumTrackTintColor="#1DB954"
          maximumTrackTintColor="#000000"
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  info: {
    marginLeft: 10,
    justifyContent: 'center',
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  artist: {
    fontSize: 14,
    color: '#666',
  },
  slider: {
    width: '100%',
    height: 40,
    marginTop: 10,
  },
});

export default SongCard;
