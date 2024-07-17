import React, { useContext } from "react";
import { Player } from "./PlayerContext"; // Adjust the path as per your file structure

const TestPage = () => {
	const playerContext = useContext(Player);

	// Validate if PlayerContext is available
	if (!playerContext) {
		throw new Error(
			"PlayerContext must be used within a PlayerContextProvider",
		);
	}

	// Destructure the needed values from playerContext
	const { currentRoom } = playerContext;

	// Log the current room to the console
	console.log("currentRoom: " + currentRoom);

	return (
		<div>
			<h1>Test Page</h1>
			<p>Current Room: {currentRoom}</p>
			{/* Add more components and logic here */}
		</div>
	);
};

export default TestPage;
