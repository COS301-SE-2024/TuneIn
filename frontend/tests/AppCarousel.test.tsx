import React from "react";
import { View, Text } from "react-native"; // Import View and Text from react-native
import { render } from "@testing-library/react-native";
import AppCarousel from "../app/components/AppCarousel"; // Adjust the import path as per your project structure

describe("AppCarousel component", () => {
	const mockData = [
		{ id: 1, title: "Item 1" },
		{ id: 2, title: "Item 2" },
		{ id: 3, title: "Item 3" },
	];

	it("renders correctly with mock data", () => {
		const renderItem = ({ item }: { item: { id: number; title: string } }) => (
			<View testID={`item-${item.id}`}>
				<Text>{item.title}</Text>
			</View>
		);

		const { getByTestId, getByText } = render(
			<AppCarousel data={mockData} renderItem={renderItem} />,
		);

		// Check if each item in mockData is rendered
		mockData.forEach((item) => {
			const itemElement = getByTestId(`item-${item.id}`);
			expect(itemElement).toBeTruthy();
			expect(getByText(item.title)).toBeTruthy();
		});
	});
});
