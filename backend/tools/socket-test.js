import dotenv from "dotenv";
dotenv.config();

const testMessage = {
	userID: process.env.SOCKET_SENDER,
	body: {
		messageBody: "The first message sent using our app's sockets",
		sender: process.env.SOCKET_SENDER,
		roomID: process.env.SOCKET_ROOM_ID,
	},
};

import io from "socket.io-client";

const socket = io("http://localhost:3000/live-chat", {
	transports: ["websocket"],
});

socket.on("error", (error) => {
	console.error("Error:", error);
});

console.log("Connecting to the server...");
socket.on("connect", () => {
	console.log("Connected to the server!");
	console.log(socket.connected);

	socket.emit("connectUser", JSON.stringify(testMessage));
	console.log(`Event sent: connectUser`);
	socket.on("connected", (response) => {
		console.log(`Received response for connectUser:`, response);
		socket.emit("joinRoom", JSON.stringify(testMessage));
		console.log(`Event sent: joinRoom`);
		socket.on("userJoinedRoom", (response) => {
			console.log(`Received response for joinRoom:`, response);
			socket.emit("getLiveChatHistory", JSON.stringify(testMessage));
			console.log(`Event sent: getLiveChatHistory`);
			socket.on("chatHistory", (response) => {
				console.log(`Received response for getLiveChatHistory:`, response);
				socket.emit("liveMessage", JSON.stringify(testMessage));
				console.log(`Event sent: liveMessage`);
				socket.on("liveMessage", (response) => {
					console.log(`Received response for liveMessage:`, response);
					socket.emit("leaveRoom", JSON.stringify(testMessage));
					console.log(`Event sent: leaveRoom`);
					socket.on("userLeftRoom", (response) => {
						console.log(`Received response for leaveRoom:`, response);
						socket.disconnect();
					});
				});
			});
		});
	});
});
socket.connect();
