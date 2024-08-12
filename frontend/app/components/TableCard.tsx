import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface TableCardProps {
	title: string; // Title above the table
	headers: string[]; // Array of headers for the table
	data: string[][]; // 2D array for table data (3x3)
}

const TableCard: React.FC<TableCardProps> = ({ title, headers, data }) => {
	return (
		<View style={styles.card}>
			<Text style={styles.cardTitle}>{title}</Text>
			<View style={styles.table}>
				<View style={styles.tableRow}>
					{headers.map((header, index) => (
						<Text key={index} style={styles.tableHeader}>
							{header}
						</Text>
					))}
				</View>
				{data.map((row, rowIndex) => (
					<View key={rowIndex} style={styles.tableRow}>
						{row.map((cell, cellIndex) => (
							<Text key={cellIndex} style={styles.tableCell}>
								{cell}
							</Text>
						))}
					</View>
				))}
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	card: {
		backgroundColor: "#fff",
		borderRadius: 8,
		padding: 15,
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
		marginBottom: 15,
		marginLeft: 5,
	},
	table: {},
	tableRow: {
		flexDirection: "row",
		justifyContent: "space-between",
	},
	tableHeader: {
		flex: 1,
		fontWeight: "bold",
		paddingVertical: 8,
		textAlign: "center",
		borderBottomWidth: 1,
		borderBottomColor: "#ccc", // Only a line under the headers
		backgroundColor: "#08BDBD",
	},
	tableCell: {
		flex: 1,
		paddingVertical: 8,
		textAlign: "center",
	},
});

export default TableCard;
