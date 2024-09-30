import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import SongVote from "./rooms/SongVote";
import {
	RoomSongDto,
	getAlbumArtUrl,
	constructArtistString,
	getTitle,
} from "../models/RoomSongDto";
import { useLive } from "../LiveContext";
import { colors } from "../styles/colors";

interface SongListProps {
	track: RoomSongDto;
	showVoting?: boolean;
}

const SongList: React.FC<SongListProps> = ({ track, showVoting = true }) => {
	const { currentSong, roomQueue } = useLive();
	const albumCoverUrl = getAlbumArtUrl(track);
	const [isCurrentSong, setIsCurrentSong] = useState(false);

	useEffect(() => {
		const song: RoomSongDto | undefined = roomQueue.find(
			(s) => s.spotifyID === track.spotifyID,
		);
		if (song) {
			setIsCurrentSong(currentSong?.spotifyID === track.spotifyID);
		} else {
			setIsCurrentSong(false);
		}
	}, [currentSong, roomQueue, track]);

	return (
		<View
			style={[styles.container, isCurrentSong ? styles.currentSong : null]}
			testID="song-container"
		>
			<Text style={styles.songNumber}>{track.index}</Text>
			<Image
				source={{ uri: albumCoverUrl }}
				style={styles.albumCover}
				testID="album-cover-image"
			/>
			<View style={styles.infoContainer}>
				<Text
					style={[
						styles.songName,
						isCurrentSong ? styles.currentSongText : null,
					]}
				>
					{getTitle(track)}
				</Text>
				<Text style={styles.artist}>{constructArtistString(track)}</Text>
			</View>

			{showVoting && <SongVote song={track} />}
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flexDirection: "row",
		alignItems: "center",
		padding: 16,
		backgroundColor: "#f9f9f9",
		borderRadius: 8,
		marginVertical: 8,
	},
	currentSong: {
		backgroundColor: "#f0f0f0", // Highlight color for current song
	},
	songNumber: {
		fontSize: 16,
		fontWeight: "bold",
		marginRight: 16,
	},
	albumCover: {
		width: 60,
		height: 60,
		borderRadius: 4,
		marginRight: 16,
	},
	infoContainer: {
		flex: 1,
		justifyContent: "center",
	},
	songName: {
		fontSize: 14,
		fontWeight: "bold",
	},
	currentSongText: {
		color: colors.primary, // Text color for current song
	},
	artist: {
		fontSize: 14,
		color: "#666",
	},
	moreButton: {
		marginLeft: 16,
	},
});

export default SongList;
