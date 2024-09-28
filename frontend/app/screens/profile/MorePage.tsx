import React, { useState, useCallback, useRef } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	Animated,
	StyleSheet,
	NativeScrollEvent,
	NativeSyntheticEvent,
	FlatList,
} from "react-native";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import FavoriteSongs from "../../components/FavoriteSong";
import UserItem from "../../components/UserItem";

const MorePage: React.FC = () => {
	const params = useLocalSearchParams();
	const items = Array.isArray(params.items)
		? JSON.parse(params.items[0])
		: JSON.parse(params.items);

	const navigation = useNavigation();
	const [scrollY] = useState(new Animated.Value(0));
	const previousScrollY = useRef(0);
	const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
	const flatListRef = useRef<FlatList<any>>(null);

	const createTimeString = (seconds: number) => {
		// Calculate minutes and seconds
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;

		// Format the result as "minutes:seconds"
		const timeString = `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
		return timeString;
	};
	const handleScroll = useCallback(
		({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
			const currentOffset = nativeEvent.contentOffset.y;
			const direction = currentOffset > previousScrollY.current ? "down" : "up";
			previousScrollY.current = currentOffset;

			if (scrollTimeout.current) {
				clearTimeout(scrollTimeout.current);
			}

			scrollTimeout.current = setTimeout(() => {
				if (currentOffset <= 0 || direction === "up") {
					scrollY.setValue(0);
				} else {
					scrollY.setValue(100);
				}
			}, 50);
		},
		[scrollY],
	);

	const renderResult = ({ item }: { item: any }) => {
		if (params.type === "user") {
			return <UserItem user={item}></UserItem>;
		}

		if (params.type === "song") {
			return (
				<FavoriteSongs
					key={item.id}
					songTitle={item.title}
					artist={item.artists}
					duration={item.duration ? createTimeString(item.duration) : null}
					albumArt={item.cover}
					onPress={() => {}}
				/>
			);
		}
		return null;
	};

	return (
		<View style={styles.container}>
			<View style={styles.header}>
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					testID="back-button"
				>
					<Ionicons name="chevron-back" size={30} color="black" />
				</TouchableOpacity>
				<Text style={[styles.title, { paddingRight: 30 }]}>{params.title}</Text>
			</View>
			<FlatList
				ref={flatListRef}
				data={items}
				renderItem={renderResult}
				contentContainerStyle={styles.resultsContainer}
				onScroll={handleScroll}
				// ListFooterComponent={renderFooter}
				testID="flatlist"
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 30,
		backgroundColor: "#fff",
	},
	roomCardPadding: {
		marginTop: 20,
		alignItems: "center",
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 20,
	},
	title: {
		fontSize: 24,
		fontWeight: "bold",
		color: "#333",
		textAlign: "center",
		flex: 1,
	},
	resultsContainer: {
		paddingVertical: 10,
	},
});

export default MorePage;
