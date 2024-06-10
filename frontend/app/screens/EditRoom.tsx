import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Room } from "../models/Room";

const EditRoom: React.FC = () => {
    const router = useRouter();
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

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="bg-white">
            <View className="p-5 flex-1">
                <Text className="text-3xl font-bold text-gray-800 mb-3">Edit Room</Text>
                
                <Text className="text-gray-800 mb-1">Room Name:</Text>
                <TextInput
                    className="bg-gray-200 p-3 rounded mb-3"
                    value={name}
                    onChangeText={setName}
                />

                <Text className="text-gray-800 mb-1">Song Name:</Text>
                <TextInput
                    className="bg-gray-200 p-3 rounded mb-3"
                    value={songName}
                    onChangeText={setSongName}
                />

                <Text className="text-gray-800 mb-1">Artist Name:</Text>
                <TextInput
                    className="bg-gray-200 p-3 rounded mb-3"
                    value={artistName}
                    onChangeText={setArtistName}
                />

                <Text className="text-gray-800 mb-1">Description:</Text>
                <TextInput
                    className="bg-gray-200 p-3 rounded mb-3"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                />

                <Text className="text-gray-800 mb-1">Tags (comma separated):</Text>
                <TextInput
                    className="bg-gray-200 p-3 rounded mb-5"
                    value={tags}
                    onChangeText={setTags}
                />

                <TouchableOpacity
                    className="bg-blue-500 rounded-full py-3 px-6"
                    onPress={handleSave}
                >
                    <Text className="text-white text-center text-lg font-bold">Save</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
};

export default EditRoom;
