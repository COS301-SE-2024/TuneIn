import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { colors } from "../../styles/colors";
import { Room } from "../../models/Room";

export interface RoomDetailsProps {
	room: Room;
}

const RoomDetails: React.FC<RoomDetailsProps> = ({ room }) => {
	// Split the genre string into an array if it exists
	const genres = room.genre ? room.genre.split(",") : [];

	return (
		<View style={styles.container}>
			<Image source={{ uri: room.backgroundImage }} style={styles.imageSize} />
			<Text style={styles.sectionTitle}>Room Description</Text>
			<Text style={styles.description}>{room.description}</Text>

			{/* Genres Section */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Genre</Text>
				<View style={styles.tagsContainer}>
					{genres.length > 0 ? (
						genres.map((genre, index) => (
							<View key={index} style={styles.tag}>
								<Text style={styles.tagText}>{genre.trim()}</Text>
							</View>
						))
					) : (
						<Text style={styles.noDataText}>No genre available</Text>
					)}
				</View>
			</View>

			{/* Language Section */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Language</Text>
				<View style={styles.tag}>
					<Text style={styles.tagText}>{room.language}</Text>
				</View>
			</View>

			{/* Tags Section */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Tags</Text>
				<View style={styles.tagsContainer}>
					{room.tags.length > 0 ? (
						room.tags.map((tag, index) => (
							<View key={index} style={styles.tag}>
								<Text style={styles.tagText}>{tag}</Text>
							</View>
						))
					) : (
						<Text style={styles.noDataText}>No tags available</Text>
					)}
				</View>
			</View>

			{/* Explicit and NSFW Tags */}
			<View style={styles.tagsContainer}>
				{room.isExplicit && (
					<View style={styles.explicitTag}>
						<Text style={styles.explicitTagText}>Explicit</Text>
					</View>
				)}
				{room.isNsfw && (
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
		marginBottom: 20,
	},
	tagsContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginVertical: 10,
	},
	tag: {
		fontSize: 14,
		color: "black",
		fontWeight: "500",
		backgroundColor: colors.primary,
		borderRadius: 12,
		paddingVertical: 8,
		paddingHorizontal: 16,
		marginRight: 12,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	tagText: {
		color: "#FFF",
	},
	noDataText: {
		fontSize: 14,
		fontStyle: "italic",
		color: "#666",
	},
	explicitTag: {
		borderRadius: 8,
		backgroundColor: "#F7F9FC",
		borderColor: "#8B8FA8",
		borderWidth: 1,
		paddingVertical: 9,
		paddingHorizontal: 16,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	explicitTagText: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#0B0B0B",
		textAlign: "center",
	},
	nsfwTag: {
		borderRadius: 8,
		backgroundColor: "#F7F9FC",
		borderColor: "#8B8FA8",
		borderWidth: 1,
		paddingVertical: 9,
		paddingHorizontal: 16,
		marginBottom: 12,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	nsfwTagText: {
		fontSize: 16,
		fontWeight: "bold",
		color: "#0B0B0B",
		textAlign: "center",
	},
});

export default RoomDetails;
