import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import Voting from './Voting';
import { Ionicons } from '@expo/vector-icons';

interface SongListProps {
  songName: string;
  artist: string;
  albumCoverUrl: string;
  voteCount: number;
  showVoting?: boolean;
  songNumber: number; // Add this prop for the song number
  index: number; // Index of the song in the list
  isCurrent: boolean; // Indicates if this song is the currently playing song
  swapSongs: (index: number, direction: 'up' | 'down') => void; // Function to swap songs
}

const SongList: React.FC<SongListProps> = ({ songName, artist, albumCoverUrl, voteCount, showVoting = false, songNumber, index, isCurrent, swapSongs }) => {
  return (
    <View style={[styles.container, isCurrent ? styles.currentSong : null]}>
      <Text style={styles.songNumber}>{songNumber}</Text>
      <Image source={{ uri: albumCoverUrl }} style={styles.albumCover} />
      <View style={styles.infoContainer}>
        <Text style={[styles.songName, isCurrent ? styles.currentSongText : null]}>{songName}</Text>
        <Text style={styles.artist}>{artist}</Text>
      </View>
      {showVoting && (
        <Voting
          voteCount={voteCount}
          setVoteCount={(newVoteCount) => {}}
          index={index}
          swapSongs={swapSongs}
        />
      )}
      <TouchableOpacity style={styles.moreButton}>
        <Ionicons name="ellipsis-vertical" size={24} color="black" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    marginVertical: 8,
  },
  currentSong: {
    backgroundColor: '#f0f0f0', // Highlight color for current song
  },
  songNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 16,
  },
  albumCover: {
    width: 60,
    height: 60,
    borderRadius: 4,
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  songName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  currentSongText: {
    color: 'blue', // Text color for current song
  },
  artist: {
    fontSize: 14,
    color: '#666',
  },
  moreButton: {
    marginLeft: 16,
  },
});

export default SongList;
