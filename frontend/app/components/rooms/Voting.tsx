import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { RoomSongDto } from "../../models/RoomSongDto";
import { useLive } from "../../LiveContext";

interface VotingProps {
	song: RoomSongDto;
	voteCount: number;
	index: number;
	swapSongs: (index: number, direction: "up" | "down") => void;
}

const Voting: React.FC<VotingProps> = ({
	song,
	voteCount,
	index,
	swapSongs,
}) => {
	const { roomControls } = useLive();
	const [currentVoteCount, setCurrentVoteCount] = useState(voteCount);
	const [userVote, setUserVote] = useState<"up" | "down" | null>(null);

	const handleUpvote = () => {
		let newVoteCount = currentVoteCount;
		if (userVote === "up") {
			// Remove upvote
			roomControls.queue.undoSongVote(song);
			newVoteCount -= 1;
			setUserVote(null);
		} else if (userVote === "down") {
			// Change downvote to upvote
			roomControls.queue.swapSongVote(song);
			newVoteCount += 2;
			setUserVote("up");
		} else {
			// Cast upvote
			roomControls.queue.upvoteSong(song);
			newVoteCount += 1;
			setUserVote("up");
		}

		setCurrentVoteCount(newVoteCount);
		swapSongs(index, "up");
	};

	const handleDownvote = () => {
		let newVoteCount = currentVoteCount;
		if (userVote === "down") {
			// Remove downvote
			roomControls.queue.undoSongVote(song);
			newVoteCount += 1;
			setUserVote(null);
		} else if (userVote === "up") {
			// Change upvote to downvote
			roomControls.queue.swapSongVote(song);
			newVoteCount -= 2;
			setUserVote("down");
		} else {
			// Cast downvote
			newVoteCount -= 1;
			roomControls.queue.downvoteSong(song);
			setUserVote("down");
		}

		setCurrentVoteCount(newVoteCount);
		swapSongs(index, "down");
	};

	return (
		<View style={styles.votingContainer}>
			<TouchableOpacity onPress={handleUpvote} testID="upvote-button">
				<Ionicons
					name="arrow-up-outline"
					size={24}
					color={userVote === "up" ? "green" : "gray"}
				/>
			</TouchableOpacity>
			<Text style={styles.voteCount}>{currentVoteCount}</Text>
			<TouchableOpacity onPress={handleDownvote} testID="downvote-button">
				<Ionicons
					name="arrow-down-outline"
					size={24}
					color={userVote === "down" ? "red" : "gray"}
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

export default Voting;
