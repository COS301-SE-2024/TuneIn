import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "expo-router";

const AllFriends: React.FC = () => {
	const navigation = useNavigation();

	const goBack = () => {
		navigation.goBack();
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Welcome to the Friends Page</Text>
			<TouchableOpacity onPress={goBack}>
				<Text style={styles.goBackText}>Go Back</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		paddingTop: 16,
		paddingHorizontal: 16,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#4A4A4A",
		marginTop: 8,
		marginBottom: 8,
	},
	goBackText: {
		fontSize: 16,
		color: "#1E90FF",
	},
});

export default AllFriends;
