// components/SongCard.tsx
import React from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';

interface Track {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: { url: string }[] }; // Album art images
  explicit: boolean; // Explicit tag
}

interface SongCardProps {
  track: Track;
  onPlay: () => void;
  onAdd: () => void;
  onRemove: () => void;
  isAdded: boolean;
}

const SongCard: React.FC<SongCardProps> = ({ track, onPlay, onAdd, onRemove, isAdded }) => {
  return (
    <View style={styles.card}>
      <Image source={{ uri: track.album.images[0].url }} style={styles.albumArt} />
      <View style={styles.infoContainer}>
        <Text style={styles.title}>{track.name}</Text>
        <Text style={styles.artist}>{track.artists.map(artist => artist.name).join(', ')}</Text>
        {track.explicit && <Text style={styles.explicit}>Explicit</Text>}
      </View>
      <View style={styles.buttonContainer}>
        <Button title="Play" onPress={onPlay} />
        <Button
          title={isAdded ? '-' : '+'}
          onPress={isAdded ? onRemove : onAdd}
          color={isAdded ? 'red' : 'green'}
        />
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
