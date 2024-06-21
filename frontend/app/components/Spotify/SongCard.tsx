// components/SongCard.tsx
import React from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Feather } from '@expo/vector-icons'; // Import Feather icon from expo/vector-icons

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] };
  explicit: boolean; // Explicit tag
}

interface SongCardProps {
  track: Track;
  onPlay: () => void;
  onPause: () => void;
  isPlaying: boolean;
  onAdd: () => void;
  onRemove: () => void;
  onDrag: () => void; // New prop for drag functionality
}

const SongCard: React.FC<SongCardProps> = ({
  track,
  onPlay,
  onPause,
  isPlaying,
  onAdd,
  onRemove,
  onDrag,
}) => {
  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={onDrag} style={styles.grip}>
        <Feather name="menu" size={24} color="black" />
      </TouchableOpacity>
      <Image source={{ uri: track.album.images[0].url }} style={styles.albumArt} />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{track.name}</Text>
        <Text style={styles.artist}>{track.artists.map(artist => artist.name).join(', ')}</Text>
        {track.explicit && <Text style={styles.explicit}>Explicit</Text>}
      </View>
      <View style={styles.buttonContainer}>
        <Button title={isPlaying ? "Pause" : "Play"} onPress={isPlaying ? onPause : onPlay} />
        <Button title="-" onPress={onRemove} color="red" />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    margin: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 5,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  grip: {
    paddingRight: 10,
  },
  albumArt: {
    width: 50,
    height: 50,
    borderRadius: 5,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  artist: {
    fontSize: 16,
    color: '#666',
  },
  explicit: {
    fontSize: 14,
    color: 'red',
    marginTop: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default SongCard;
