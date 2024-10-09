import React, { useEffect, useState } from "react";
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
	const [userUpvote, setUserUpvote] = useState<boolean>(false);
	const [userDownvote, setUserDownvote] = useState<boolean>(false);

	useEffect(() => {
		if (!currentUser) {
			console.error("User not found");
			return;
		}
		const userVote: VoteDto | undefined = currentRoomVotes.find(
			(v) => v.spotifyID === song.spotifyID && v.userID === currentUser.userID,
		);
		if (userVote) {
			setUserUpvote(userVote.isUpvote);
			setUserDownvote(!userVote.isUpvote);
		} else {
			setUserUpvote(false);
			setUserDownvote(false);
		}
	}, [currentRoomVotes]);

	const handleUpvote = () => {
		if (userUpvote) {
			// Remove upvote
			roomControls.queue.undoSongVote(song);
		} else if (userDownvote) {
			// Change downvote to upvote
			roomControls.queue.swapSongVote(song);
		} else {
			// Cast upvote
			roomControls.queue.upvoteSong(song);
		}
	};

	const handleDownvote = () => {
		if (userDownvote) {
			// Remove downvote
			roomControls.queue.undoSongVote(song);
		} else if (userUpvote) {
			// Change upvote to downvote
			roomControls.queue.swapSongVote(song);
		} else {
			// Cast downvote
			roomControls.queue.downvoteSong(song);
		}
	};

	return (
		<View style={styles.votingContainer}>
			<TouchableOpacity onPress={handleUpvote} testID="upvote-button">
				<Ionicons
					name="arrow-up-outline"
					size={24}
					color={userUpvote ? "green" : "gray"}
				/>
			</TouchableOpacity>
			<Text style={styles.voteCount}>{song.score}</Text>
			<TouchableOpacity onPress={handleDownvote} testID="downvote-button">
				<Ionicons
					name="arrow-down-outline"
					size={24}
					color={userDownvote ? "red" : "gray"}
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
