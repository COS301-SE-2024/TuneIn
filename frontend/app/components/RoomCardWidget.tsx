import React from 'react';
import { View, Text, ImageBackground, StyleSheet, Image, Dimensions } from 'react-native';
import { Room } from './models/Room';

interface RoomCardWidgetProps {
  roomCard: Room;
}

const RoomCardWidget: React.FC<RoomCardWidgetProps> = ({ roomCard }) => {
  const screenWidth = Dimensions.get('window').width;
  const cardWidth = screenWidth * 0.8; // 80% of screen width

  return (
    <View style={[styles.card, { width: cardWidth }]}>
      <ImageBackground
        source={{ uri: roomCard.backgroundImage }}
        style={styles.backgroundImage}
        imageStyle={styles.imageStyle}
      >
        <View style={styles.overlay} />
        <View style={styles.topContent}>
          <Text style={styles.name}>{roomCard.name}</Text>
          <Text style={styles.songArtist}>{`${roomCard.songName} by ${roomCard.artistName}`}</Text>
        </View>
        <View style={styles.bottomContent}>
          <Text style={styles.description}>{roomCard.description}</Text>
          <View style={styles.footer}>
            <View style={styles.userInfo}>
              <Image source={{ uri: roomCard.userProfile }} style={styles.userProfile} />
              <Text style={styles.username}>{roomCard.username}</Text>
            </View>
            <Text style={styles.tags}>{roomCard.tags.join(' • ')}</Text>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    margin: 10,
    borderRadius: 15,
    overflow: 'hidden',
    height: 210,
  },
  backgroundImage: {
    flex: 1,
  },
  imageStyle: {
    borderRadius: 15,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  topContent: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
  },
  bottomContent: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: 10,
    borderRadius: 15,
  },
  name: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  songArtist: {
    color: 'white',
    fontSize: 16,
    marginVertical: 5,
  },
  description: {
    color: 'white',
    fontSize: 14,
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userProfile: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  username: {
    color: 'white',
    fontSize: 16,
  },
  tags: {
    color: 'white',
    fontSize: 14,
  },
});

export default RoomCardWidget;
