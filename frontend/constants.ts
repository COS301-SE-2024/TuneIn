// `common/constants.ts`
export const SOCKET_EVENTS = {
	//shared
	CONNECT_USER: "connectUser",
	DISCONNECT_USER: "disconnectUser",
	JOIN_ROOM: "joinRoom",
	LEAVE_ROOM: "leaveRoom",
	ERROR: "error",
	PING: "ping",

	//for live chat
	LIVE_MESSAGE: "liveMessage",
	GET_LIVE_CHAT_HISTORY: "getLiveChatHistory",
	EMOJI_REACTION: "emojiReaction",

	//for direct messages
	ENTER_DM: "enterDirectMessage",
	DIRECT_MESSAGE: "directMessage",
	GET_DIRECT_MESSAGE_HISTORY: "getDirectMessageHistory",
	TYPING: "typing",
	STOP_TYPING: "stopTyping",
	MODIFY_DM: "modifyDirectMessage",
	EXIT_DM: "exitDirectMessage",

	//sync after getting chat history???

	//synchronised media playback
	INIT_PLAY: "initPlay",
	INIT_PAUSE: "initPause",
	INIT_STOP: "initStop",
	INIT_SKIP: "initSkip",
	INIT_PREV: "initPrev",
	SEEK_MEDIA: "seekMedia",
	CURRENT_MEDIA: "currentMedia",
	MEDIA_SYNC: "mediaSync",
	REQUEST_QUEUE: "requestQueue",

	//for queue & voting
	UPVOTE_SONG: "upvoteSong",
	DOWNVOTE_SONG: "downvoteSong",
	UNDO_SONG_VOTE: "undoSongVote",
	SWAP_SONG_VOTE: "swapSongVote",
	ENQUEUE_SONG: "enqueueSong",
	DEQUEUE_SONG: "dequeueSong",

	SONG_ADDED: "songAdded",
	SONG_REMOVED: "songRemoved",
	VOTE_UPDATED: "voteUpdated",
	QUEUE_STATE: "queueState",
	ROOM_SETTINGS_CHANGED: "roomSettingsChanged",

	//for server responses
	CONNECTED: "connected",
	DISCONNECTED: "disconnected",
	ROOM_JOINED: "roomJoined",
	ROOM_LEFT: "roomLeft",
	MESSAGE_SENT: "messageSent",
	MESSAGE_RECEIVED: "messageReceived",
	USER_JOINED_ROOM: "userJoinedRoom",
	USER_LEFT_ROOM: "userLeftRoom",
	LIVE_CHAT_HISTORY: "liveChatHistory",

	PLAY_MEDIA: "playMedia",
	PAUSE_MEDIA: "pauseMedia",
	STOP_MEDIA: "stopMedia",

	USER_ONLINE: "userOnline",
	USER_OFFLINE: "userOffline",
	CHAT_MODIFIED: "chatModified",
	DM_HISTORY: "dmHistory",
};
