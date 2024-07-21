import React, { useState } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Dimensions,
	StyleSheet,
} from "react-native";

interface MyToggleWidgetProps {
	firstOption: string;
	secondOption: string;
	onChanged: (isFirstOptionSelected: boolean) => void;
}

const MyToggleWidget: React.FC<MyToggleWidgetProps> = ({
	firstOption,
	secondOption,
	onChanged,
}) => {
	const screenWidth = Dimensions.get("window").width;
	const toggleWidth = screenWidth * 0.85; // 85% of screen width

	const [isFirstOptionSelected, setIsFirstOptionSelected] = useState(true);

	const handleToggle = (isFirstOption: boolean) => {
		setIsFirstOptionSelected(isFirstOption);
		onChanged(isFirstOption);
	};

	return (
		<View style={[styles.toggleContainer, { width: toggleWidth }]}>
			<View style={styles.toggleRow}>
				<TouchableOpacity
					style={[
						styles.toggleButton,
						isFirstOptionSelected && styles.selectedButton,
						styles.leftButton,
					]}
					onPress={() => handleToggle(true)}
				>
					<Text
						style={[
							styles.toggleText,
							isFirstOptionSelected
								? styles.selectedText
								: styles.unselectedText,
						]}
					>
						{firstOption}
					</Text>
				</TouchableOpacity>
				<TouchableOpacity
					style={[
						styles.toggleButton,
						!isFirstOptionSelected && styles.selectedButton,
						styles.rightButton,
					]}
					onPress={() => handleToggle(false)}
				>
					<Text
						style={[
							styles.toggleText,
							!isFirstOptionSelected
								? styles.selectedText
								: styles.unselectedText,
						]}
					>
						{secondOption}
					</Text>
				</TouchableOpacity>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	toggleContainer: {
		backgroundColor: "#E5E7EB", // Light grey background for the container
		borderRadius: 24,
		padding: 1,
		height: 50,
	},
	toggleRow: {
		flexDirection: "row",
		width: "100%",
		height: "100%",
	},
	toggleButton: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 2,
		borderRadius: 24,
	},
	leftButton: {
		borderTopLeftRadius: 24,
		borderBottomLeftRadius: 24,
	},
	rightButton: {
		borderTopRightRadius: 24,
		borderBottomRightRadius: 24,
	},
	selectedButton: {
		backgroundColor: "#08BDBD", // Darker grey-blue for the selected state
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 3,
	},
	toggleText: {
		fontSize: 16,
		fontWeight: "500",
	},
	selectedText: {
		color: "white",
	},
	unselectedText: {
		color: "#4B5563", // Dark grey for unselected text
	},
});

export default MyToggleWidget;
