import React from "react";
import { View, FlatList, StyleSheet } from "react-native";

interface CarouselProps<T> {
	data: T[];
	renderItem: ({ item }: { item: T }) => JSX.Element;
}

const AppCarousel = <T,>({ data, renderItem }: CarouselProps<T>) => {
	return (
		<View style={styles.container}>
			<FlatList
				data={data}
				renderItem={renderItem}
				keyExtractor={(_, index) => index.toString()}
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.contentContainer}
				ItemSeparatorComponent={() => <View style={styles.separator} />} // Add space between items
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		marginBottom: 15,
		marginRight: 0,
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
