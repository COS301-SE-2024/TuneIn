import React, { useState } from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";

interface MyToggleWidgetProps {
    firstOption: string;
    secondOption: string;
    onChanged: (isFirstOptionSelected: boolean) => void;
}

const MyToggleWidget: React.FC<MyToggleWidgetProps> = ({ firstOption, secondOption, onChanged }) => {
    const screenWidth = Dimensions.get("window").width;
    const toggleWidth = screenWidth * 0.85; // 90% of screen width

    const [isFirstOptionSelected, setIsFirstOptionSelected] = useState(true);

    const handleToggle = (isFirstOption: boolean) => {
        setIsFirstOptionSelected(isFirstOption);
        onChanged(isFirstOption);
    };

    return (
        <View
            className="rounded-xl bg-gray-200 p-1"
            style={{ width: toggleWidth, height: 50,
                borderTopLeftRadius: 24,
                borderBottomLeftRadius: 24,
                borderRadius: 24,
                borderTopRightRadius: 24,
                borderBottomRightRadius: 24,
            }}
        >
            <View className="flex-row">
                <TouchableOpacity
                    className={`flex-1 items-center justify-center p-2`}
                    style={{
                        backgroundColor: isFirstOptionSelected ? '#8B8FA8' : 'transparent',
                        borderTopLeftRadius: 24,
                        borderBottomLeftRadius: 24,
                        borderRadius: 24,
                    }}
                    onPress={() => handleToggle(true)}
                >
                    <Text className={`text-lg font-medium ${isFirstOptionSelected ? 'text-white' : 'text-gray-600'}`}>
                        {firstOption}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    className={`flex-1 items-center justify-center p-2`}
                    style={{
                        backgroundColor: !isFirstOptionSelected ? '#8B8FA8' : 'transparent',
                        borderTopRightRadius: 24,
                        borderBottomRightRadius: 24,
                        borderRadius: 24,
                    }}
                    onPress={() => handleToggle(false)}
                >
                    <Text className={`text-lg font-medium ${!isFirstOptionSelected ? 'text-white' : 'text-gray-600'}`}>
                        {secondOption}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

export default MyToggleWidget;
