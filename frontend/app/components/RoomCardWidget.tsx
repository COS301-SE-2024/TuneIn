import React from "react";
import { View, Text, ImageBackground, Image, Dimensions, TouchableOpacity } from "react-native";
import { Room } from "../models/Room";
import { useRouter } from "expo-router";

interface RoomCardWidgetProps {
    roomCard: Room;
}

const RoomCardWidget: React.FC<RoomCardWidgetProps> = ({ roomCard }) => {
    const screenWidth = Dimensions.get("window").width;
    const cardWidth = screenWidth * 0.8; // 80% of screen width

    const router = useRouter();

    const navigateToEditRoom = () => {
        router.navigate({
            pathname: "/screens/EditRoom",
            params: { room: JSON.stringify(roomCard) },
        });
    };

    return (
        <View
            className="m-2 rounded-xl overflow-hidden h-48"
            style={{ width: cardWidth }}
        >
            <ImageBackground
                source={{ uri: roomCard.backgroundImage }}
                className="flex-1"
                style={{ borderRadius: 15 }}
            >
                <View
                    style={{
                        position: "absolute",
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                    }}
                />
                <View className="absolute top-2 left-2 right-2">
                    <Text className="text-white text-lg font-bold">{roomCard.name}</Text>
                    <Text className="text-white text-sm mt-1">
                        Now playing: <Text className="font-bold">{roomCard.songName}</Text>{" "}
                        by <Text className="font-bold">{roomCard.artistName}</Text>
                    </Text>
                </View>
                <View className="flex-1 justify-end p-2 rounded-xl">
                    <Text className="text-white text-xs mb-2">
                        {roomCard.description}
                    </Text>
                    {roomCard.mine ? (
                        <View className="flex-row justify-between items-center">
                            <TouchableOpacity
                                className="bg-blue-500 rounded-2xl w-14 h-14 flex items-center justify-center"
                                onPress={navigateToEditRoom}
                            >
                                <Text className="text-white text-xl font-bold">✎</Text>
                            </TouchableOpacity>
                            <Text className="text-white text-xs">
                                {roomCard.tags.join(" • ")}
                            </Text>
                        </View>
                    ) : (
                        <View className="flex-row justify-between items-center">
                            <View className="flex-row items-center">
                                <Image
                                    source={{ uri: roomCard.userProfile }}
                                    className="w-10 h-10 rounded-full mr-2"
                                />
                                <Text className="text-white text-base">{roomCard.username}</Text>
                            </View>
                            <Text className="text-white text-xs">
                                {roomCard.tags.join(" • ")}
                            </Text>
                        </View>
                    )}
                </View>
            </ImageBackground>
        </View>
    );
};

export default RoomCardWidget;
