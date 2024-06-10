import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const RoomCard = ({ roomName, songName, artistName, username }) => {
    return (
        <View style={styles.container}>
            <Text style={styles.roomName}>{roomName}</Text>
            <Text style={styles.songName}>{songName}</Text>
            <Text style={styles.artistName}>{artistName}</Text>
            <Text style={styles.username}>{username}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 150,
        marginRight: 12,
        padding: 16,
        backgroundColor: 'white',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOpacity: 0.12,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowRadius: 6,
        elevation: 4,
    },
    roomName: {
        fontSize: 16,
        fontWeight: '600',
    },
    songName: {
        fontSize: 14,
        fontWeight: '400',
    },
    artistName: {
        fontSize: 14,
        fontWeight: '400',
    },
    username: {
        fontSize: 12,
        fontWeight: '400',
    },
});

export default RoomCard;