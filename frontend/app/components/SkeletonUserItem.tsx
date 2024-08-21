import React from "react";
import { View, Text, StyleSheet } from "react-native";

const SkeletonUserItem = () => {
	return (
		<View style={styles.container}>
			<View style={styles.profileRow}>
				<View style={styles.profileImagePlaceholder} />
				<View style={styles.detailsPlaceholder}>
					<View style={styles.profileNamePlaceholder}><Text>            </Text></View>
					<View style={styles.usernamePlaceholder} />
				</View>
			</View>
			<View style={styles.followButtonPlaceholder} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		borderBottomWidth: 1,
		borderBottomColor: "#ccc",
		paddingBottom: 20,
		paddingHorizontal: 20,
		backgroundColor: "#fff",
	},
	profileRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 20,
		flex: 1,
	},
	profileImagePlaceholder: {
		width: 70,
		height: 70,
		borderRadius: 40, // Same as profile image
		backgroundColor: "#e0e0e0",
		marginRight: 20,
		marginTop: 20,
	},
	detailsPlaceholder: {
		paddingTop: 25,
		flex: 1,
	},
	profileNamePlaceholder: {
		width: "60%",
		height: 18,
		backgroundColor: "#e0e0e0",
		marginBottom: 8,
		borderRadius: 4, // Added radius for a more realistic look
	},
	usernamePlaceholder: {
		width: "40%",
		height: 16,
		backgroundColor: "#e0e0e0",
		borderRadius: 4, // Added radius for consistency
	},
	followButtonPlaceholder: {
		marginTop: 20,
		paddingVertical: 5,
		paddingHorizontal: 10,
		borderRadius: 15,
		backgroundColor: "#e0e0e0",
		alignItems: "center",
		marginRight: 35, // Adjust margin to move button more to the left
		width: "32%",
		height: "20%",
	},
});

export default SkeletonUserItem;
