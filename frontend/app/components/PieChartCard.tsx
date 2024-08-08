import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { colors } from "../styles/colors";

interface PieChartCardProps {
	returningVisitors: number;
	newVisitors: number;
}

const PieChartCard: React.FC<PieChartCardProps> = ({
	returningVisitors,
	newVisitors,
}) => {
	const data = [
		{
			name: " Returning",
			population: returningVisitors,
			color: colors.primary,
			legendFontColor: "#7F7F7F",
			legendFontSize: 14,
		},
		{
			name: " New",
			population: newVisitors,
			color: "black",
			legendFontColor: "#7F7F7F",
			legendFontSize: 14,
		},
	];

	return (
		<View style={styles.card}>
			<Text style={styles.cardTitle}>Visitors Breakdown</Text>
			<View style={styles.chartContainer}>
				<PieChart
					data={data}
					width={300}
					height={150}
					chartConfig={{
						backgroundColor: "#ffffff",
						backgroundGradientFrom: "#ffffff",
						backgroundGradientTo: "#ffffff",
						color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
						labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
						strokeWidth: 2,
						barPercentage: 0.5,
					}}
					accessor="population"
					backgroundColor="transparent"
					paddingLeft="0" // Removed padding
				/>
			</View>
			<View style={styles.legend}>
				<View style={styles.legendItem}>
					<View
						style={[styles.legendColor, { backgroundColor: colors.primary }]}
					/>
					<Text style={styles.legendText}>Returning Visitors</Text>
				</View>
				<View style={styles.legendItem}>
					<View style={[styles.legendColor, { backgroundColor: "black" }]} />
					<Text style={styles.legendText}>New Visitors</Text>
				</View>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	card: {
		flex: 1,
		backgroundColor: "white",
		padding: 20,
		borderRadius: 10,
		marginHorizontal: 5,
		shadowColor: "#000",
		shadowOffset: { width: 0, height: 4 },
		shadowOpacity: 0.25,
		shadowRadius: 3.84,
		elevation: 5,
	},
	cardTitle: {
		fontSize: 18,
		color: "black",
		fontWeight: "bold",
		marginBottom: 10,
	},
	chartContainer: {
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 20,
	},
	legend: {
		flexDirection: "row",
		justifyContent: "space-around",
	},
	legendItem: {
		flexDirection: "row",
		alignItems: "center",
	},
	legendColor: {
		width: 15,
		height: 15,
		marginRight: 5,
	},
	legendText: {
		fontSize: 14,
		color: "black",
	},
});

export default PieChartCard;
