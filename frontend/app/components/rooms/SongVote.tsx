import React, { useCallback, useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useLive } from "../../LiveContext";
import { VoteDto } from "../../models/VoteDto";
import { RoomSongDto } from "../../../api";

interface SongVoteProps {
	score: number;
	vote: VoteDto | undefined;
	upvote: () => void;
	downvote: () => void;
}

const SongVote: React.FC<SongVoteProps> = ({
	score,
	upvote,
	downvote,
	vote,
}) => {
	return (
		<View style={styles.votingContainer}>
			<TouchableOpacity onPress={upvote} testID="upvote-button">
				<Ionicons
					name="arrow-up-outline"
					size={24}
					color={vote && vote.isUpvote ? "green" : "gray"}
				/>
			</TouchableOpacity>
			<Text style={styles.voteCount}>{score}</Text>
			<TouchableOpacity onPress={downvote} testID="downvote-button">
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
