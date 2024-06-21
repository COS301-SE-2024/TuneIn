import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import RoomDetails, { RoomDetailsProps } from '../components/RoomDetailsComponent';
import { useRouter } from 'expo-router';

const roomDetails: RoomDetailsProps = {
  name: 'Chill Vibes',
  description: 'A place to relax and unwind with great music.',
  genre: 'Jazz',
  language: 'English',
  roomSize: 'Medium',
  isExplicit: true,
  isNsfw: true,
};

const RoomInfoScreen = () => {
  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.roomName}>{roomDetails.name}</Text>
      </View>
      <RoomDetails {...roomDetails} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: '#E8EBF2',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  closeButton: {
    marginRight: 8,
  },
  roomName: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default RoomInfoScreen;
