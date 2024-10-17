import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { colors } from "../../styles/colors";
import { Room } from "../../models/Room";

export interface RoomDetailsProps {
	room: Room;
}

const RoomDetails: React.FC<RoomDetailsProps> = ({ room }) => {
	// Split the genre string into an array if it exists

	// define a function that will convert a date into a readable format string
	const formatDate = (date: string): string => {
		// show date and time in a readable format
		return new Date(date).toLocaleString();
	};
	const privateText = room.isPrivate ? "Private" : "Public";
	const isScheduled: boolean =
		(room.start_date !== undefined && room.start_date !== null) ||
		(room.end_date !== undefined && room.end_date !== null);
	const startDate: undefined | Date = room.start_date
		? new Date(room.start_date)
		: undefined;
	const endDate: undefined | Date = room.end_date
		? new Date(room.end_date)
		: undefined;

	return (
		<View style={styles.container}>
			<Image source={{ uri: room.backgroundImage }} style={styles.imageSize} />
			<Text style={styles.sectionTitle}>Room Description</Text>
			<Text style={styles.description}>{room.description}</Text>

			{/* Language Section */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Language</Text>
				<View style={styles.tagsContainer}>
					<View style={styles.cardThing}>
						<Text style={styles.nsfwTagText}>{room.language}</Text>
					</View>
				</View>
			</View>

			{/* Date Created Section */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Date Created</Text>
				<View style={styles.cardThing}>
					<Text style={styles.explicitTagText}>
						{formatDate(new Date(room.date_created).toISOString())}
					</Text>
				</View>
			</View>

			{/* Scheduled Section */}
			{isScheduled && (
				<View style={styles.section}>
					<Text style={styles.sectionTitle}>Schedule</Text>
					<View style={styles.scheduledDatesContainer}>
						{startDate && (
							<Text style={styles.scheduledDates}>
								{typeof startDate === "string"
									? startDate
									: "Start Date - " + formatDate(startDate.toISOString())}
							</Text>
						)}
						{endDate && (
							<Text style={styles.scheduledDates}>
								{typeof endDate === "string"
									? endDate
									: "End Date - " + formatDate(endDate.toISOString())}
							</Text>
						)}
					</View>
				</View>
			)}

			{/* Tags Section */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Genres</Text>
				<View style={styles.tagsContainer}>
					{room.tags.length > 0 ? (
						room.tags.map((tag, index) => (
							<View key={index} style={styles.cardThing}>
								<Text style={styles.explicitTagText}>{tag}</Text>
							</View>
						))
					) : (
						<Text style={styles.noDataText}>No genres available</Text>
					)}
				</View>
			</View>

			{/* Explicit and NSFW Tags */}
			<View style={styles.section}>
				<Text style={styles.sectionTitle}>Tags</Text>
				<View style={styles.tagsContainer}>
					{room.isExplicit && (
						<View style={styles.cardThing}>
							<Text style={styles.explicitTagText}>Explicit</Text>
						</View>
					)}
					{room.isNsfw && (
						<View style={styles.cardThing}>
							<Text style={styles.nsfwTagText}>NSFW</Text>
						</View>
					)}

					<View style={styles.cardThing}>
						<Text style={styles.nsfwTagText}>{privateText}</Text>
					</View>
				</View>
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
	scheduledDates: {
		fontSize: 16,
	},
	scheduledDatesContainer: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginVertical: 10,
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
	cardThing: {
		marginRight: 12,
		marginBottom: 10,
		paddingHorizontal: 14,
		paddingVertical: 8,
		backgroundColor: "rgba(232, 235, 242, 1)",
		borderRadius: 10,
		justifyContent: "center",
		alignItems: "center",
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
