import React from "react";
import { View, Text, StyleSheet, Dimensions, ScrollView } from "react-native";
import { LineChart } from "react-native-chart-kit";

interface LineGraphCardProps {
	data: {
		value: number;
		label: string;
	}[],
	title: string; // Title for the card
}

const needsScrolling = true;

const LineGraphCard: React.FC<LineGraphCardProps> = ({ data, title }) => {
	console.log("data", data);
	console.log("data from the thing", data.map((item) => item.label), data.map((item) => item.value));
	return (
		<View style={styles.card}>
			<Text style={styles.cardTitle}>{title}</Text>
			<ScrollView
				horizontal={needsScrolling}
				showsHorizontalScrollIndicator={needsScrolling}
			>
			<LineChart
				data={{
					labels: data.map((item) => item.label),
					datasets: [
						{
							data: data.map((item) => item.value),
						},
					],
				}}
				width={needsScrolling ? data.length * 50 : Dimensions.get('window').width - 40}// From StyleSheet
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
			</ScrollView>
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
