import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, ActivityIndicator, Button, ScrollView } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router'; // Import useNavigation hook
import NowPlaying from '../components/NowPlaying'
import BioSection from '../components/BioSection'
import GenreList from '../components/GenreList';
import RoomCard from '../components/RoomCard';
// import { Room } from '../components/models/Room';

const ProfileScreen: React.FC = () => {
    const favoriteRooms = [
        { roomName: "Room 1", songName: "Song 1", artistName: "Artist 1", username: "user1" },
        { roomName: "Room 2", songName: "Song 2", artistName: "Artist 2", username: "user2" },
    ];
    const recentRooms = [
        { roomName: "Room 4", songName: "Song 4", artistName: "Artist 4", username: "user4" },
        { roomName: "Room 5", songName: "Song 5", artistName: "Artist 5", username: "user5" },
    ];
    const dummyData = {
        name: "John Doe",
        username: "john",
        bio: "Hello, I'm John!",
        profile_picture: require("../Assets/MockProfilePic.jpeg",),
        favoriteSongs: [{ title: "Song 1", artist: "Artist 1", duration: "3:45" }],
        favoriteRooms: [{ roomName: "Room 1", songName: "Song 1", artistName: "Artist 1", username: "user1" }],
        recentRooms: [{ roomName: "Room 2", songName: "Song 2", artistName: "Artist 2", username: "user2" }]
    };
    const genres = ["Pop", "Hip-Hop", "Jazz", "Classical", "Rock"];

    return (
        <ScrollView>
            <View style={{ padding: 15 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ flex: 1 }} />
                    <TouchableOpacity >
                        <Text style={[styles.buttonText, { paddingBottom: 20 }]}>Settings</Text>
                    </TouchableOpacity>
                </View>
                <Text style={{ fontWeight: '600', fontSize: 20, textAlign: 'center' }}>Profile</Text>
                <View style={{ alignItems: 'center', marginTop: 20 }}>
                    <Image
                        source={dummyData.profile_picture}
                        style={{ width: 125, height: 125, borderRadius: 125 / 2 }}
                    />
                </View>
                <Text style={{ fontSize: 20, fontWeight: '600', textAlign: 'center' }}>{dummyData.name}</Text>
                <Text style={{ fontWeight: '400', textAlign: 'center' }}>@{dummyData.username}</Text>
                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 10 }}>
                    <View style={{ alignItems: 'center' }}>
                        <Text style={{ fontSize: 20, fontWeight: '600' }}>17</Text>
                        <Text style={{ fontSize: 15, fontWeight: '400' }}>Followers</Text>
                    </View>
                    <View style={{ marginLeft: 60, alignItems: 'center' }}>
                        <Text style={{ fontSize: 20, fontWeight: '600' }}>270</Text>
                        <Text style={{ fontSize: 15, fontWeight: '400' }}>Following</Text>
                    </View>
                </View>
                <Text style={{ fontWeight: '700', textAlign: 'center', marginTop: 30 }}>
                instagram.com/john
                </Text>
                <View style={{ alignItems: 'center', marginTop: 20 , paddingBottom: 20}}>
                    <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText}>Edit</Text>
                    </TouchableOpacity>
                </View>
                <View style={{ paddingHorizontal: 20 }}>
                    <NowPlaying title={"Don't Smile At Me"} artist={"Billie Eilish"} duration={"3:05"} />
                </View>
                <View style={{ paddingHorizontal: 20 }}>
                    <BioSection content={"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do"} />
                </View>
                <View style={{ paddingHorizontal: 20 }}>
                    <GenreList items={genres}></GenreList>
                </View>
                <View style={{ paddingHorizontal: 20 }}>
                    <Text style={styles.title}>Favorite Rooms</Text>
                    <View style={styles.roomCardsContainer}>
                        {favoriteRooms.slice(0, 2).map(room => (
                            <RoomCard
                                key={room.roomName}
                                roomName={room.roomName}
                                songName={room.songName}
                                artistName={room.artistName}
                                username={room.username}
                            />
                        ))}
                    </View>
                </View>
                <View style={{ paddingHorizontal: 20 }}>
                    <Text style={styles.title}>Recently Visited</Text>
                    <View style={styles.roomCardsContainer}>
                        {recentRooms.slice(0, 2).map(room => (
                            <RoomCard
                                key={room.roomName}
                                roomName={room.roomName}
                                songName={room.songName}
                                artistName={room.artistName}
                                username={room.username}
                            />
                        ))}
                    </View>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    roomCardsContainer: {
        flexDirection: 'row',
        // justifyContent: 'space-between',
        marginBottom: 20,
    },

    title: {
        fontSize: 20,
        fontWeight: '600',
        paddingBottom: 10,
    },
    button: {
        width: 155,
        height: 37,
        backgroundColor: 'rgba(158, 171, 184, 1)',
        borderRadius: 18.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buttonText: {
        color: 'black',
        fontWeight: '600',
    },
});

export default ProfileScreen;