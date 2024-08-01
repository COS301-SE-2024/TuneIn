// `common/constants.ts`
export const SOCKET_EVENTS = {
	//shared
	CONNECT: "connectUser",
	DISCONNECT: "disconnectUser",
	JOIN_ROOM: "joinRoom",
	LEAVE_ROOM: "leaveRoom",
	ERROR: "error",
	PING: "ping",

	//for live chat
	LIVE_MESSAGE: "liveMessage",
	GET_LIVE_CHAT_HISTORY: "getLiveChatHistory",

	//for direct messages
	DIRECT_MESSAGE: "directMessage",
	GET_DIRECT_MESSAGE_HISTORY: "getDirectMessageHistory",
	TYPING: "typing",
	STOP_TYPING: "stopTyping",

	//sync after getting chat history???

	//synchronised media playback
	INIT_PLAY: "initPlay",
	INIT_PAUSE: "initPause",
	INIT_STOP: "initStop",
	SEEK_MEDIA: "seekMedia",
	CURRENT_MEDIA: "currentMedia",
	QUEUE_STATE: "queueState",
	MEDIA_SYNC: "mediaSync",

	//for server responses
	CONNECTED: "connected",
	DISONNECTED: "disconnected",
	ROOM_JOINED: "roomJoined",
	ROOM_LEFT: "roomLeft",
	MESSAGE_SENT: "messageSent",
	MESSAGE_RECEIVED: "messageReceived",
	USER_JOINED_ROOM: "userJoinedRoom",
	USER_LEFT_ROOM: "userLeftRoom",
	CHAT_HISTORY: "chatHistory",

	PLAY_MEDIA: "playMedia",
	PAUSE_MEDIA: "pauseMedia",
	STOP_MEDIA: "stopMedia",
};
