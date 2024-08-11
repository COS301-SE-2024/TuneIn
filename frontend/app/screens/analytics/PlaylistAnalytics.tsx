import React from "react";
import {
	View,
	Text,
	TouchableOpacity,
	ScrollView,
	StyleSheet,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import MetricsCard from "../../components/MetricsCard";
import HorizontalBarGraphCard from "../../components/HorizontalBarGraphCard";
import TableCard from "../../components/TableCard";
import TopSong from "../../components/TopSong";
import MostDownvotedCard from "../../components/MostDownvotedCard";

const PlaylistAnalytics: React.FC = () => {
	const router = useRouter();

	const datah = [
		{ label: "Room A", value: 57 },
		{ label: "Room B", value: 75 },
		{ label: "Room C", value: 18 },
		{ label: "Room D", value: 48 },
		{ label: "Room E", value: 6 },
	];

	const headers = ["Song", "Upvotes", "Downvotes"];
	const dataTable = [
		["Song A", "654", "215"],
		["Song B", "552", "165"],
		["Song C", "421", "54"],
	];

	const topSongs = [
		{
			albumImage: "https://i.mdel.net/i/db/2019/12/1255378/1255378-800w.jpg",
			songName: "Song 1",
			plays: 1200,
		},
		{
			albumImage: "https://i.mdel.net/i/db/2019/12/1255378/1255378-800w.jpg",
			songName: "Song 2",
			plays: 1100,
		},
		{
			albumImage: "https://i.mdel.net/i/db/2019/12/1255378/1255378-800w.jpg",
			songName: "Song 3",
			plays: 1050,
		},
		{
			albumImage: "https://i.mdel.net/i/db/2019/12/1255378/1255378-800w.jpg",
			songName: "Song 4",
			plays: 980,
		},
		{
			albumImage: "https://i.mdel.net/i/db/2019/12/1255378/1255378-800w.jpg",
			songName: "Song 5",
			plays: 950,
		},
	];

	const song = {
		albumImage: "https://i.mdel.net/i/db/2019/12/1255378/1255378-800w.jpg",
		songName: "Song Title",
		artistName: "Artist Name",
	};

	return (
		<ScrollView contentContainerStyle={styles.scrollView}>
			<View style={styles.container}>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => router.back()} testID="back-button">
						<Ionicons name="chevron-back" size={24} color="black" />
					</TouchableOpacity>
					<Text style={styles.headerTitle}>Playlist Analytics</Text>
					<View style={styles.headerSpacer} />
				</View>
				<View style={styles.SongCard}>
					<Text style={styles.headerSong}>Song Performance Analysis</Text>
					{topSongs.map((song, index) => (
						<TopSong
							key={index}
							albumImage={song.albumImage}
							songName={song.songName}
							plays={song.plays}
							songNumber={index + 1} // Provide song number (1-based index)
						/>
					))}
				</View>
				<View style={styles.cardsContainer}>
					<MetricsCard
						title="Total Upvotes"
						number="5,461"
						percentage="+15,2%"
					/>
					<MetricsCard
						title="Total Downvotes"
						number="1,567"
						percentage="-1,8%"
					/>
				</View>
				<MostDownvotedCard
					albumImage={song.albumImage}
					songName={song.songName}
					artistName={song.artistName}
				/>
				<HorizontalBarGraphCard data={datah} title="Playlist Saves" />
				<TableCard
					title="Upvotes vs Downvotes"
					headers={headers}
					data={dataTable}
				/>
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	headerContainer: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between", // To space out the items evenly
		marginBottom: 20,
	},
	backButton: {
		flex: 1,
	},
	headerText: {
		flex: 2,
		fontSize: 20,
		fontWeight: "bold",
		textAlign: "center",
	},
	placeholder: {
		flex: 1, // Placeholder with the same flex value as backButton to balance the layout
	},
	logoContainer: {
		alignItems: "center",
		marginBottom: 40,
	},
	container: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 20,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 10,
	},
	closeButton: {
		fontSize: 20,
		fontWeight: "bold",
	},
	headerTitle: {
		fontSize: 20,
		fontWeight: "bold",
	},
	headerSpacer: {
		width: 20,
	},
	scrollView: {
		flexGrow: 1,
	},
	cardsContainer: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 20,
	},
	SongCard: {
		padding: 10,
		backgroundColor: "#fff",
		// borderRadius: 8,
		// shadowColor: "#000",
		// shadowOffset: { width: 0, height: 4 },
		// shadowOpacity: 0.25,
		// shadowRadius: 3.84,
		// elevation: 5,
	},
	headerSong: {
		fontSize: 20,
		fontWeight: "bold",
		textAlign: "center",
		marginBottom: 10,
		marginTop: 10,
	},
});

export default PlaylistAnalytics;
