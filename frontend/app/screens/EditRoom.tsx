import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { Room } from "../models/Room";

const EditRoom: React.FC = () => {
    const router = useRouter();
    const navigation = useNavigation(); // Get navigation object
    const { room: roomParam } = useLocalSearchParams();
    const room: Room = roomParam ? JSON.parse(roomParam as string) : {};

    const [name, setName] = useState(room.name || "");
    const [songName, setSongName] = useState(room.songName || "");
    const [artistName, setArtistName] = useState(room.artistName || "");
    const [description, setDescription] = useState(room.description || "");
    const [tags, setTags] = useState(room.tags.join(", ") || "");

    const handleSave = () => {
        // Logic to save the edited room details
        // For now, we can simply log the updated details
        console.log({
            name,
            songName,
            artistName,
            description,
            tags: tags.split(",").map(tag => tag.trim())
        });

        // Navigate back to the previous screen or the room list
        router.back();
    };

    const handleEditPlaylists = () => {
        // Navigate to EditPlaylists screen and pass room ID and playlists field
        router.navigate({
            pathname: "/screens/EditPlaylists",
            params: {
                roomId: room.id,
                playlists: room.playlist,
            },
        });
    };

    return (
        <ScrollView contentContainerStyle={styles.scrollView}>
            <View style={styles.container}>
                <Text style={styles.heading}>Edit Room</Text>
                
                <Text style={styles.label}>Room Name:</Text>
                <TextInput
                    style={styles.input}
                    value={name}
                    onChangeText={setName}
                />

                <Text style={styles.label}>Song Name:</Text>
                <TextInput
                    style={styles.input}
                    value={songName}
                    onChangeText={setSongName}
                />

                <Text style={styles.label}>Artist Name:</Text>
                <TextInput
                    style={styles.input}
                    value={artistName}
                    onChangeText={setArtistName}
                />

                <Text style={styles.label}>Description:</Text>
                <TextInput
                    style={[styles.input, styles.multilineInput]}
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />

                <Text style={styles.label}>Tags (comma separated):</Text>
                <TextInput
                    style={styles.input}
                    value={tags}
                    onChangeText={setTags}
                />

                <TouchableOpacity
                    style={styles.saveButton}
                    onPress={handleSave}
                >
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>

                {/* Edit Playlist Button */}
                <TouchableOpacity
                    style={styles.editPlaylistButton}
                    onPress={handleEditPlaylists}
                >
                    <Text style={styles.editPlaylistButtonText}>Edit Playlist</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    scrollView: {
        flexGrow: 1,
        backgroundColor: "#ffffff",
    },
    container: {
        padding: 20,
        flex: 1,
    },
    heading: {
        fontSize: 24,
        fontWeight: "bold",
        color: "#333333",
        marginBottom: 20,
    },
    label: {
        color: "#333333",
        marginBottom: 5,
    },
    input: {
        backgroundColor: "#eeeeee",
        padding: 10,
        borderRadius: 8,
        marginBottom: 10,
        fontSize: 16,
    },
    multilineInput: {
        minHeight: 100,
        textAlignVertical: "top", // For Android
    },
    saveButton: {
        backgroundColor: "#1E90FF",
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginTop: 20,
    },
    saveButtonText: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
    editPlaylistButton: {
        backgroundColor: "#4CAF50",
        borderRadius: 25,
        paddingVertical: 12,
        paddingHorizontal: 24,
        marginTop: 10,
    },
    editPlaylistButtonText: {
        color: "#ffffff",
        fontSize: 18,
        fontWeight: "bold",
        textAlign: "center",
    },
});

export default EditRoom;
