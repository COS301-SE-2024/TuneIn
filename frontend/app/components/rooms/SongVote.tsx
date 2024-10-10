import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLive } from "../../LiveContext";
import { VoteDto } from "../../models/VoteDto";
import { RoomSongDto } from "../../../api";

interface SongVoteProps {
	song: RoomSongDto;
}

const SongVote: React.FC<SongVoteProps> = ({ song }) => {
	const { roomControls, currentRoomVotes, currentUser } = useLive();
	const [vote, setVote] = useState<VoteDto | undefined>(
		currentRoomVotes.find(
			(v) => v.spotifyID === song.spotifyID && v.userID === currentUser?.userID,
		),
	);

	useEffect(() => {
		updateVoteFromCurrentRoomVotes();
	}, [currentRoomVotes]);

	const updateVoteFromCurrentRoomVotes = useCallback(() => {
		if (!currentUser) {
			console.error("User not found");
			return;
		}
		const userVote: VoteDto | undefined = currentRoomVotes.find(
			(v) => v.spotifyID === song.spotifyID && v.userID === currentUser.userID,
		);
		if (
			vote !== userVote ||
			JSON.stringify(vote) !== JSON.stringify(userVote)
		) {
			setVote(userVote);
		}
	}, [currentRoomVotes, currentUser, song.spotifyID, vote]);

	const handleVoteChange = (isUpvote: boolean) => {
		const newVote: VoteDto = {
			isUpvote: isUpvote,
			userID: currentUser?.userID || "",
			spotifyID: song.spotifyID,
			createdAt: new Date(),
		};
		setVote(newVote);

		// Reset vote after 10 seconds
		setTimeout(() => {
			updateVoteFromCurrentRoomVotes();
		}, 10000);

		// Call appropriate roomControls method
		if (isUpvote) {
			if (vote && vote.isUpvote) {
				// Remove upvote
				roomControls.queue.undoSongVote(song);
			} else if (vote && !vote.isUpvote) {
				// Change downvote to upvote
				roomControls.queue.swapSongVote(song);
			} else {
				// Cast upvote
				roomControls.queue.upvoteSong(song);
			}
		} else {
			if (vote && !vote.isUpvote) {
				// Remove downvote
				roomControls.queue.undoSongVote(song);
			} else if (vote && vote.isUpvote) {
				// Change upvote to downvote
				roomControls.queue.swapSongVote(song);
			} else {
				// Cast downvote
				roomControls.queue.downvoteSong(song);
			}
		}
	};

	const handleUpvote = () => handleVoteChange(true);
	const handleDownvote = () => handleVoteChange(false);

	return (
		<View style={styles.votingContainer}>
			<TouchableOpacity onPress={handleUpvote} testID="upvote-button">
				<Ionicons
					name="arrow-up-outline"
					size={24}
					color={vote && vote.isUpvote ? "green" : "gray"}
				/>
			</TouchableOpacity>
			<Text style={styles.voteCount}>{song.score}</Text>
			<TouchableOpacity onPress={handleDownvote} testID="downvote-button">
				<Ionicons
					name="arrow-down-outline"
					size={24}
					color={vote && !vote.isUpvote ? "red" : "gray"}
				/>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	votingContainer: {
		flexDirection: "row",
		alignItems: "center",
		marginLeft: 16,
	},
	voteCount: {
		marginHorizontal: 8,
		fontSize: 16,
		fontWeight: "bold",
	},
});

export default SongVote;
