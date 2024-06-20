import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Dimensions, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import { FontAwesome5 } from '@expo/vector-icons';

const LyricsScreen: React.FC = () => {
  const router = useRouter();
  const [modalVisible, setModalVisible] = useState(true);

  const closeModal = () => {
    setModalVisible(false);
    router.back();
  };

  const song = {
    title: "Your Song Title",
    artist: "Your Artist Name",
    album: "Your Album Name",
    lyrics: "Here are the song lyrics...\n\nMore lyrics here...\n\nEven more lyrics...",
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={closeModal}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalView}>
          <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>×</Text>
          </TouchableOpacity>
          <Text style={styles.songTitle}>{song.title}</Text>
          <Text style={styles.songArtist}>{song.artist}</Text>
          <Text style={styles.songAlbum}>{song.album}</Text>
          <ScrollView style={styles.lyricsContainer}>
            <Text style={styles.lyricsText}>{song.lyrics}</Text>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    width: Dimensions.get('window').width - 40,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  closeButton: {
    alignSelf: 'flex-end',
  },
  songTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  songArtist: {
    fontSize: 18,
    marginBottom: 5,
  },
  songAlbum: {
    fontSize: 16,
    color: 'gray',
    marginBottom: 20,
  },
  lyricsContainer: {
    width: '100%',
  },
  lyricsText: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default LyricsScreen;
