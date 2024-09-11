import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { colors } from "../../styles/colors";
import { color } from "react-native-elements/dist/helpers";

export interface RoomDetailsProps {
	image: string;
	name: string;
	description: string;
	genre: string;
	language: string;
	roomSize: string;
	isExplicit: boolean;
	isNsfw: boolean;
}

const RoomDetails: React.FC<RoomDetailsProps> = ({
	name,
	image,
	description,
	genre,
	language,
	roomSize,
	isExplicit,
	isNsfw,
}) => {
	return (
		<View style={styles.container}>
			<Image source={{ uri: image }} style={styles.imageSize} />
			<Text style={styles.sectionTitle}>Room Description</Text>
			<Text style={styles.description}>{description}</Text>
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Genre</Text>
			</View>
			<View style={styles.section}>
				<Text style={styles.tag}>{genre}</Text>
			</View>

			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Language</Text>
			</View>
			<View style={styles.section}>
				<Text style={styles.tag}>{language}</Text>
			</View>

			<View style={styles.tagsContainer}>
				{isExplicit && (
					<View style={styles.explicitTag}>
						<Text style={styles.explicitTagText}>Explicit</Text>
					</View>
				)}
				{isNsfw && (
					<View style={styles.nsfwTag}>
						<Text style={styles.nsfwTagText}>NSFW</Text>
					</View>
				)}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexGrow: 1,
		backgroundColor: "#FFFFFF",
		padding: 30,
	},
	imageSize: {
		width: "100%",
		height: 200,
		borderRadius: 10,
		marginBottom: 20,
	},
	sectionTitle: {
		fontSize: 18,
		fontWeight: "bold",
		marginBottom: 8,
	},
	description: {
		fontSize: 14,
		marginBottom: 20,
	},
	section: {
		marginBottom: 5,
		flexDirection: "row",
		flexWrap: "wrap",
	},
	tag: {
		fontSize: 14,
		// fontFamily: "Plus Jakarta Sans",
		color: "black",
		fontWeight: 500,
		backgroundColor: colors.primary,
		borderRadius: 12,
		paddingVertical: 8,
		paddingHorizontal: 16,
		marginRight: 12,
		marginBottom: 20,
		// borderRadius: 56,
		// marginBottom: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	explicitTag: {
		borderRadius: 8,
		backgroundColor: "#F7F9FC",
		borderColor: "#8B8FA8",
		borderWidth: 1,
		paddingVertical: 9,
		paddingHorizontal: 16,
		marginHorizontal: 16,
		// borderRadius: 56,
		marginBottom: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	nsfwTag: {
		borderRadius: 8,
		backgroundColor: "#F7F9FC",
		borderColor: "#8B8FA8",
		borderWidth: 1,
		paddingVertical: 9,
		paddingHorizontal: 16,
		marginHorizontal: 16,
		// borderRadius: 56,
		marginBottom: 20,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	explicitTagText: {
		fontSize: 16,
		fontFamily: "Poppins",
		color: "#0B0B0B",
		textAlign: "center",
	},
	nsfwTagText: {
		fontSize: 16,
		fontFamily: "Poppins",
		color: "#0B0B0B",
		textAlign: "center",
	},
	tagsContainer: {
		flexDirection: "row",
		justifyContent: "center",
		marginTop: 10,
	},
});

export default RoomDetails;
