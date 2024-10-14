import React, { useCallback, useEffect, useState } from "react";
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
import { RoomSongDto } from "../../api";
import { VoteDto } from "../models/VoteDto";

interface SongListProps {
	song: SongPair;
	showVoting?: boolean;
}

const SongList: React.FC<SongListProps> = ({ song, showVoting = true }) => {
	const {
		roomControls,
		currentUser,
		currentSong,
		roomQueue,
		currentRoomVotes,
	} = useLive();
	const albumCoverUrl: string = getAlbumArtUrl(song);
	const [isCurrentSong, setIsCurrentSong] = useState(false);
	const [localScore, setLocalScore] = useState<number>(song.song.score);
	const [vote, setVote] = useState<VoteDto | undefined>(
		currentRoomVotes.find(
			(v) => v.spotifyID === song.track.id && v.userID === currentUser?.userID,
		),
	);

	const updateVoteFromCurrentRoomVotes = useCallback(() => {
		if (!currentUser) {
			console.error("User not found");
			return;
		}
		const userVote: VoteDto | undefined = currentRoomVotes.find(
			(v) => v.spotifyID === song.track.id && v.userID === currentUser.userID,
		);
		if (
			vote !== userVote ||
			JSON.stringify(vote) !== JSON.stringify(userVote)
		) {
			setVote(userVote);
		}
		if (song.song.score !== localScore) {
			setLocalScore(song.song.score);
		}
	}, [
		currentRoomVotes,
		currentUser,
		localScore,
		song.song.score,
		song.track.id,
		vote,
	]);

	const handleVoteChange = (isUpvote: boolean) => {
		const newVote: VoteDto = {
			isUpvote: isUpvote,
			userID: currentUser?.userID || "",
			spotifyID: song.track.id,
			createdAt: new Date(),
		};

		// Call appropriate roomControls method
		if (isUpvote) {
			console.log(`Upvoting song '${song.track.name}' (${song.track.id})`);
			if (vote && vote.isUpvote) {
				// Remove upvote
				roomControls.queue.undoSongVote(song.song);
				setLocalScore((previousScore) => previousScore - 1);
				setVote(undefined);
			} else if (vote && !vote.isUpvote) {
				// Change downvote to upvote
				roomControls.queue.swapSongVote(song.song);
				setLocalScore((previousScore) => previousScore + 2);
				setVote(newVote);
			} else {
				// Cast upvote
				roomControls.queue.upvoteSong(song.song);
				setLocalScore((previousScore) => previousScore + 1);
				setVote(newVote);
			}
		} else {
			console.log(`Downvoting song '${song.track.name}' (${song.track.id})`);
			if (vote && !vote.isUpvote) {
				// Remove downvote
				roomControls.queue.undoSongVote(song.song);
				setLocalScore((previousScore) => previousScore + 1);
				setVote(undefined);
			} else if (vote && vote.isUpvote) {
				// Change upvote to downvote
				roomControls.queue.swapSongVote(song.song);
				setLocalScore((previousScore) => previousScore - 2);
				setVote(newVote);
			} else {
				// Cast downvote
				roomControls.queue.downvoteSong(song.song);
				setLocalScore((previousScore) => previousScore - 1);
				setVote(newVote);
			}
		}

		// Reset vote after 5 seconds
		setTimeout(() => {
			updateVoteFromCurrentRoomVotes();
		}, 5000);
	};

	const handleUpvote = () => handleVoteChange(true);
	const handleDownvote = () => handleVoteChange(false);

	useEffect(() => {
		const tmpSong: RoomSongDto | undefined = roomQueue.find(
			(s) => s.spotifyID === song.song.spotifyID,
		);
		if (tmpSong && currentSong) {
			setIsCurrentSong(tmpSong.spotifyID === currentSong.spotifyID);
		} else {
			setIsCurrentSong(false);
		}
	}, [currentSong, roomQueue, song.song.spotifyID]);

	useEffect(() => {
		updateVoteFromCurrentRoomVotes();
	}, [
		currentRoomVotes,
		song,
		updateVoteFromCurrentRoomVotes,
		roomQueue,
		currentSong,
	]);

	return (
		<View
			style={[styles.container, isCurrentSong ? styles.currentSong : null]}
			testID="song-container"
		>
			<Text style={styles.songNumber}>{song.song.index + 1}</Text>
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

			{showVoting && (
				<SongVote
					key={song.song.spotifyID}
					score={localScore}
					vote={vote}
					upvote={handleUpvote}
					downvote={handleDownvote}
				/>
			)}
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
