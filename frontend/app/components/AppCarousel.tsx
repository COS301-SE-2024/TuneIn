import React from "react";
import { View, FlatList, StyleSheet } from "react-native";
import AddRoomCard from "../components/home/addRoomCard"; // Import the AddRoomCard component
interface CarouselProps<T> {
	data: T[];
	renderItem: ({ item }: { item: T }) => JSX.Element;
	showAddRoomCard?: boolean | null; // Add a prop to conditionally show AddRoomCard
}

const AppCarousel = <T,>({
	data,
	renderItem,
	showAddRoomCard = false, // Default to false if not provided
}: CarouselProps<T>) => {
	return (
		<View style={styles.container}>
			<FlatList
				data={data}
				renderItem={({ item }) => renderItem({ item })}
				keyExtractor={(_, index) => index.toString()}
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={[
					styles.contentContainer,
					showAddRoomCard && { marginBottom: 20 }, // Apply marginBottom when showAddRoomCard is true
				]}
				ItemSeparatorComponent={() => <View style={styles.separator} />}
				ListFooterComponent={showAddRoomCard ? <AddRoomCard /> : null} // Add AddRoomCard at the end if showAddRoomCard is true
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		marginTop: 5,
		marginLeft: 10,
	},
	contentContainer: {
		paddingHorizontal: 20,
		paddingRight: 20,
	},
	separator: {
		width: 15,
	},
});

export default AppCarousel;
