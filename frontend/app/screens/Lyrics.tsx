import React from "react";
import { View, StyleSheet } from "react-native";
import LyricsDisplay from "../components/LyricsDisplay";

const LyricsScreen: React.FC = () => {
	// Replace these with your actual API key, song title, and artist
	const apiKey =
		"92gQ8Qw14QJp8Xu_L-55qUdt0tnnGfRPmXTCOjIR0aDrJcGgO4rpEFYnBQcF0Fma";
	const title = "BLUE";
	const artist = "Billie Eilish";

	console.log("Lyrics.tsx: apiKey:", apiKey);
	return (
		<View style={styles.container}>
			<LyricsDisplay apiKey={apiKey} title={title} artist={artist} />
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
});

export default LyricsScreen;

// import React, { useState } from "react";
// import {
// 	Text,
// 	TextInput,
// 	Button,
// 	StyleSheet,
// 	ScrollView,
// 	Linking,
// } from "react-native";
// import { fetchLyrics } from "../services/GeniusService";

// const LyricsScreen: React.FC = () => {
// 	const [songTitle, setSongTitle] = useState("");
// 	const [lyricsPath, setLyricsPath] = useState<string | null>(null);
// 	const [error, setError] = useState<string | null>(null);

// 	const handleFetchLyrics = async () => {
// 		setError(null);
// 		setLyricsPath(null);
// 		try {
// 			const { lyricsPath } = await fetchLyrics(songTitle);
// 			setLyricsPath(lyricsPath);
// 		} catch (err) {
// 			setError(err.message);
// 		}
// 	};

// 	return (
// 		<ScrollView contentContainerStyle={styles.container}>
// 			<TextInput
// 				style={styles.input}
// 				placeholder="Enter song title"
// 				value={songTitle}
// 				onChangeText={setSongTitle}
// 			/>
// 			<Button title="Fetch Lyrics" onPress={handleFetchLyrics} />
// 			{error && <Text style={styles.error}>{error}</Text>}
// 			{lyricsPath && (
// 				<Text style={styles.link} onPress={() => Linking.openURL(lyricsPath)}>
// 					View Lyrics
// 				</Text>
// 			)}
// 		</ScrollView>
// 	);
// };

// const styles = StyleSheet.create({
// 	container: {
// 		flex: 1,
// 		justifyContent: "center",
// 		padding: 16,
// 	},
// 	input: {
// 		borderWidth: 1,
// 		borderColor: "#ccc",
// 		padding: 8,
// 		marginBottom: 16,
// 	},
// 	error: {
// 		color: "red",
// 		marginTop: 16,
// 	},
// 	link: {
// 		marginTop: 16,
// 		color: "blue",
// 		textDecorationLine: "underline",
// 	},
// });

// export default LyricsScreen;

// import React from "react";
// import {
// 	View,
// 	Text,
// 	TouchableOpacity,
// 	ScrollView,
// 	StyleSheet,
// } from "react-native";
// import { useRouter } from "expo-router";
// import { Ionicons } from "@expo/vector-icons";

// const LyricsScreen: React.FC = () => {
// 	const router = useRouter();

// 	const song = {
// 		title: "Eternal Sunshine",
// 		artist: "Ariana Grande",
// 		lyrics: `
//       I don't care what people say
//       We both know I couldn't change you
//       I guess you could say the same
//       Can't rearrange truth
//       I've never seen someone lie like you do
//       So much, even you start to think it's true
//       Ooh
//       Get me out of this loop, yeah, yeah

//       So now we play our separate scenes
//       Now, now she's in my bed, mm-mm, layin' on your chest
//       Now I'm in my head, wonderin' how it ends
//       I'll be the first to say, "I'm sorry"
//       Now you got me feelin' sorry
//       I showed you all my demons, all my lies
//       Yet you played me like Atari
//       Now it's like I'm lookin' in the mirror
//       Hope you feel alright when you're in her
//       I found a good boy and he's on my side
//       You're just my eternal sunshine, sunshine

//       So I try to wipe my mind
//       Just so I feel less insane
//       Rather feel painless
//       I'd rather forget than know, know for sure
//       What we could've fought through behind this door, mm
//       So I close it and move, yeah, yeah

//       So now we play our separate scenes
//       Now, now he's in your bed, and layin' on my chest
//       Now I'm in my head, and wonderin' how it ends, ends, ends
//       I'll be the first to say, "I'm sorry"
//       Now you got me feelin' sorry
//       I showed you all my demons, all my lies
//       Yet you played me like Atari
//       Now it's like I'm lookin' in the mirror
//       Hope you feel alright when you're in her
//       I found a good boy and he's on my side
//       You're just my eternal sunshine, sunshine

//       Won't break, can't shake
//       This fate, rewrite
//       Deep breaths, tight chest
//       Life, death, rewind
//       Won't (won't) break (won't), can't (can't) shake (shake)
//       This (this) fate (fate), rewrite
//       Deep (deep) breaths (breaths), tight (tight) chest (chest)
//       Life (life), death (death)
//       I'll be the first to say, "I'm sorry"
//       Now you got me feelin' sorry
//       I showed you all my demons, all my lies
//       Yet you played me like Atari
//       Now it's like I'm lookin' in the mirror (won't break, can't shake)
//       Hope you feel alright when you're in her (this fate, rewrite)
//       I found a good boy and he's on my side (deep breaths, tight chest)
//       You're just my eternal sunshine, sunshine (life, death, rewind)

//       Won't (won't) break (won't), can't (can't) shake (shake)
//       This (this) fate (fate), rewrite
//       Deep (deep) breaths (breaths), tight (tight) chest (chest)
//       Life (life), death (death), rewind
//       Won't (won't) break (won't), can't (can't) shake (shake)
//       This (this) fate (fate), rewrite
//       Deep (deep) breaths (breaths), tight (tight) chest (chest)
//       Life (life), death (death)
//     `,
// 	};

// 	return (
// 		<View style={styles.container}>
// 			<TouchableOpacity
// 				onPress={() => router.back()}
// 				style={styles.closeButton}
// 			>
// 				<Ionicons name="chevron-back" size={24} color="black" />
// 			</TouchableOpacity>
// 			<Text style={styles.songTitle}>{song.title}</Text>
// 			<Text style={styles.songArtist}>{song.artist}</Text>
// 			<ScrollView style={styles.lyricsContainer}>
// 				<Text style={styles.lyricsText}>{song.lyrics}</Text>
// 			</ScrollView>
// 		</View>
// 	);
// };

// const styles = StyleSheet.create({
// 	container: {
// 		flex: 1,
// 		backgroundColor: "white",
// 		paddingTop: 20, // Adjust top padding to accommodate status bar or navigation bar
// 		paddingHorizontal: 20,
// 	},
// 	closeButton: {
// 		position: "absolute",
// 		top: 10,
// 		left: 10,
// 		zIndex: 10,
// 	},
// 	songTitle: {
// 		fontSize: 24,
// 		fontWeight: "bold",
// 		marginBottom: 10,
// 		textAlign: "center",
// 	},
// 	songArtist: {
// 		fontSize: 18,
// 		marginBottom: 5,
// 		textAlign: "center",
// 	},
// 	lyricsContainer: {
// 		flex: 1,
// 		marginTop: 10,
// 	},
// 	lyricsText: {
// 		fontSize: 16,
// 		lineHeight: 24,
// 	},
// });

// export default LyricsScreen;
