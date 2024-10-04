import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import SongVote from "./rooms/SongVote";
import {
	getAlbumArtUrl,
	constructArtistString,
	getTitle,
	SongPair,
} from "../models/SongPair";
import { useLive } from "../LiveContext";
import { colors } from "../styles/colors";
import { Track } from "@spotify/web-api-ts-sdk";
import { RoomSongDto } from "../../api";

interface SongListProps {
	song: SongPair;
	showVoting?: boolean;
}

const SongList: React.FC<SongListProps> = ({ song, showVoting = true }) => {
	const { currentSong, roomQueue } = useLive();
	const albumCoverUrl: string = getAlbumArtUrl(song);
	const [isCurrentSong, setIsCurrentSong] = useState(false);

	useEffect(() => {
		const tmpSong: RoomSongDto | undefined = roomQueue.find(
			(s) => s.spotifyID === song.song.spotifyID,
		);
		if (tmpSong) {
			setIsCurrentSong(currentSong?.spotifyID === song.song.spotifyID);
		} else {
			setIsCurrentSong(false);
		}
	}, [currentSong, roomQueue]);

	return (
		<View
			style={[styles.container, isCurrentSong ? styles.currentSong : null]}
			testID="song-container"
		>
			<Text style={styles.songNumber}>{song.song.index}</Text>
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
					{getTitle(song)}
				</Text>
				<Text style={styles.artist}>{constructArtistString(song)}</Text>
			</View>

			{showVoting && <SongVote song={song.song} />}
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
