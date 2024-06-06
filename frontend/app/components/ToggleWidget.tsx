import React, { useState } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";

interface MyToggleWidgetProps {
    firstOption: string;
    secondOption: string;
    onChanged: (isFirstOptionSelected: boolean) => void;
}

const MyToggleWidget: React.FC<MyToggleWidgetProps> = ({ firstOption, secondOption, onChanged }) => {
    const screenWidth = Dimensions.get("window").width;
    const toggleWidth = screenWidth * 0.9; // 90% of screen width

    const [isFirstOptionSelected, setIsFirstOptionSelected] = useState(true);

    const handleToggle = (isFirstOption: boolean) => {
        setIsFirstOptionSelected(isFirstOption);
        onChanged(isFirstOption);
    };

    return (
        <View
            className="rounded-xl bg-gray-200 p-1"
            style={{ width: toggleWidth, height: 50 }}
        >
            <View className="flex-row">
                <TouchableOpacity
                    className={`flex-1 rounded-lg items-center justify-center p-2 ${isFirstOptionSelected ? 'bg-gray-700 shadow' : ''}`}
                    onPress={() => handleToggle(true)}
                >
                    <Text className={`text-lg font-normal ${isFirstOptionSelected ? 'text-white' : 'text-gray-600'}`}>
                        {firstOption}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`flex-1 rounded-lg items-center justify-center p-2 ${!isFirstOptionSelected ? 'bg-gray-700 shadow' : ''}`}
                    onPress={() => handleToggle(false)}
                >
                    <Text className={`text-lg font-normal ${!isFirstOptionSelected ? 'text-white' : 'text-gray-600'}`}>
                        {secondOption}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default MyToggleWidget;
