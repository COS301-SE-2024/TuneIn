import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";

interface LineGraphCardProps {
	data: number[]; // Data for the line chart
	title: string; // Title for the card
}

const LineGraphCard: React.FC<LineGraphCardProps> = ({ data, title }) => {
	return (
		<View style={styles.card}>
			<Text style={styles.cardTitle}>{title}</Text>
			<LineChart
				data={{
					labels: [
						"Day 1",
						"Day 2",
						"Day 3",
						"Day 4",
						"Day 5",
						"Day 6",
						"Day 7",
					],
					datasets: [
						{
							data: data,
						},
					],
				}}
				width={Dimensions.get("window").width - 40} // From StyleSheet
				height={220}
				yAxisLabel=""
				yAxisSuffix=""
				chartConfig={{
					backgroundColor: "#fff",
					backgroundGradientFrom: "#fff",
					backgroundGradientTo: "#fff",
					decimalPlaces: 2,
					color: (opacity = 1) => `rgba(8, 189, 189, ${opacity})`, // Primary color for the graph line
					style: {
						borderRadius: 16,
					},
					// Customization for labels
					propsForLabels: {
						fontFamily: "System", // Use system font for labels
						fontSize: 12,
						color: "#000", // Set label color to black
					},
				}}
				bezier
				style={styles.chart}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#fff",
		borderRadius: 8,
		padding: 10,
		marginVertical: 10,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	cardTitle: {
		fontSize: 20,
		fontWeight: "bold",
		marginBottom: 20,
		marginLeft: 10,
		marginTop: 10,
	},
	chart: {
		// borderRadius: 16,
		marginLeft: -11,
	},
});

export default LineGraphCard;
