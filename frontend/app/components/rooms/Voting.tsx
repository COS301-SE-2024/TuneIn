import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface VotingProps {
	voteCount: number;
	setVoteCount: (newVoteCount: number) => void;
	index: number;
	swapSongs: (index: number, direction: "up" | "down") => void;
}

const Voting: React.FC<VotingProps> = ({
	voteCount,
	setVoteCount,
	index,
	swapSongs,
}) => {
	const [currentVoteCount, setCurrentVoteCount] = useState(voteCount);
	const [userVote, setUserVote] = useState<"up" | "down" | null>(null);

	const handleUpvote = () => {
		let newVoteCount = currentVoteCount;

		if (userVote === "up") {
			// Remove upvote
			newVoteCount -= 1;
			setUserVote(null);
		} else if (userVote === "down") {
			// Change downvote to upvote
			newVoteCount += 2;
			setUserVote("up");
		} else {
			// Cast upvote
			newVoteCount += 1;
			setUserVote("up");
		}

		setCurrentVoteCount(newVoteCount);
		setVoteCount(newVoteCount);
		swapSongs(index, "up");
	};

	const handleDownvote = () => {
		let newVoteCount = currentVoteCount;

		if (userVote === "down") {
			// Remove downvote
			newVoteCount += 1;
			setUserVote(null);
		} else if (userVote === "up") {
			// Change upvote to downvote
			newVoteCount -= 2;
			setUserVote("down");
		} else {
			// Cast downvote
			newVoteCount -= 1;
			setUserVote("down");
		}

		setCurrentVoteCount(newVoteCount);
		setVoteCount(newVoteCount);
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
