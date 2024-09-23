import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import GenreAdder from "../app/components/GenreAdder";

jest.mock("react-native-gesture-handler", () => {
	const MockView = (props) => <div {...props} />;
	return {
		GestureHandlerRootView: MockView,
		TouchableOpacity: MockView,
	};
});

const mockGenres = [
	"rock",
	"indie rock",
	"punk rock",
	"pop",
	"jazz",
	"classical",
	"hip hop",
	"country",
	"electronica",
	"reggae",
	"blues",
	"folk",
	"metal",
	"punk",
	"soul",
	"r&b",
	"funk",
	"dancehall",
	"techno",
	"ambient",
	"gospel",
	"latin",
	"reggaeton",
	"ska",
	"opera",
];

describe("AddGenre Component", () => {
	it("should render close button", () => {
		const { getByText, getByTestId } = render(
			<GenreAdder
				options={mockGenres}
				placeholder={"Search Genres"}
				visible={true}
				onSelect={() => {}}
				onClose={() => {}}
			/>,
		);

		expect(getByText("Close")).toBeTruthy();
		fireEvent.press(getByTestId("close-button"));
	});

	it("should search genres", () => {
		const { getByTestId, getByText } = render(
			<GenreAdder
				options={mockGenres}
				placeholder={"Search Genres"}
				visible={true}
				onSelect={() => {}}
				onClose={() => {}}
			/>,
		);

		fireEvent.changeText(getByTestId("genre-search-query"), "rock");

		expect(getByText("indie rock")).toBeTruthy();
	});

	it("should select searched genres", () => {
		const { getByTestId, getByText } = render(
			<GenreAdder
				options={mockGenres}
				placeholder={"Search Genres"}
				visible={true}
				onSelect={() => {}}
				onClose={() => {}}
			/>,
		);

		fireEvent.changeText(getByTestId("genre-search-query"), "rock");
		fireEvent.press(getByText("indie rock"));

		expect(getByTestId("indie rock-genre-close")).toBeTruthy();
		expect(getByText("Add Genre")).toBeTruthy();
	});

	it("should select multiple searched genres", () => {
		const { getByTestId, getByText } = render(
			<GenreAdder
				options={mockGenres}
				placeholder={"Search Genres"}
				visible={true}
				onSelect={() => {}}
				onClose={() => {}}
			/>,
		);

		fireEvent.changeText(getByTestId("genre-search-query"), "rock");
		fireEvent.press(getByText("indie rock"));
		fireEvent.press(getByTestId("punk rock-genre-option"));

		expect(getByTestId("indie rock-genre-close")).toBeTruthy();
		expect(getByTestId("punk rock-genre-close")).toBeTruthy();
		expect(getByText("Add Genres")).toBeTruthy();
	});
});
