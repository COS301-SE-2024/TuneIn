import {
	ConnectedSocket,
	MessageBody,
	OnGatewayConnection,
	OnGatewayDisconnect,
	SubscribeMessage,
	WebSocketGateway,
	WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { SOCKET_EVENTS } from "../common/constants";
import { ChatEventDto } from "./dto/chatevent.dto";
import { RoomUsersService } from "./roomusers/roomuser.service";
import { DbUtilsService } from "../modules/db-utils/db-utils.service";
import { DtoGenService } from "../modules/dto-gen/dto-gen.service";
import { LiveChatMessageDto } from "./dto/livechatmessage.dto";
import { PlaybackEventDto } from "./dto/playbackevent.dto";
import { RoomsService } from "../modules/rooms/rooms.service";
import { EventQueueService } from "./eventqueue/eventqueue.service";
// import { LiveService } from "./live.service";
import { RoomQueueService } from "../modules/rooms/roomqueue/roomqueue.service";
import { EmojiReactionDto } from "./dto/emojireaction.dto";
import { QueueEventDto } from "./dto/queueevent.dto";
import { RoomSongDto } from "../modules/rooms/dto/roomsong.dto";
import { RoomDto } from "../modules/rooms/dto/room.dto";
import { VoteDto } from "../modules/rooms/dto/vote.dto";
import { DmUsersService } from "./dmusers/dmusers.service";
import { UserDto } from "../modules/users/dto/user.dto";
import { DirectMessageDto } from "../modules/users/dto/dm.dto";
import { UsersService } from "../modules/users/users.service";

@WebSocketGateway({
	namespace: "/live",
	transports: ["websocket"],
	cors: {
		origin: "*",
		methods: ["GET", "POST"],
	},
})
//@UseFilters(new WsExceptionFilter())
export class LiveGateway implements OnGatewayConnection, OnGatewayDisconnect {
	constructor(
		private readonly roomUsers: RoomUsersService,
		private readonly dmUsers: DmUsersService,
		private readonly dbUtils: DbUtilsService,
		private readonly dtogen: DtoGenService,
		private readonly roomService: RoomsService,
		private readonly eventQueueService: EventQueueService,
		// private readonly liveService: LiveService,
		private readonly roomQueue: RoomQueueService,
		private readonly userService: UsersService,
	) {
		this.roomService.server = this.server;
		// this.liveService.setServer(this.server);
	}

	@WebSocketServer() server: Server;

	async handleConnection(client: Socket) {
		console.log("Client connected with ID: " + client.id);
		this.roomService.server = this.server;
		// this.liveService.setServer(this.server);
	}

	async handleDisconnect(client: Socket) {
		this.roomService.server = this.server;
		// this.liveService.setServer(this.server);
		try {
			console.log("Client (id: " + client.id + ") disconnected");
			if (this.roomUsers.getConnectedUser(client.id) !== null) {
				this.roomUsers.leaveRoom(client.id);
			}
			this.roomUsers.removeConnectedUser(client.id);
			this.dmUsers.disconnectChat(client.id);
			this.dmUsers.removeConnectedUser(client.id);
			client.disconnect();
		} catch (error) {
			console.error(error);
		}
	}

	@SubscribeMessage("message")
	async handleMessage(@MessageBody() p: string): Promise<void> {
		this.eventQueueService.addToQueue("message", async () => {
			console.log(p);
			//Hello World
			this.server.emit("message", { response: "Hello World" });
		});
	}

	@SubscribeMessage(SOCKET_EVENTS.CONNECT_USER)
	async handleAuth(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(SOCKET_EVENTS.CONNECT_USER, async () => {
			try {
				//auth
				const payload: ChatEventDto = await this.validateChatEvent(p);
				if (!payload.userID) {
					throw new Error("No userID provided");
				}
				// get connected client ids
				// pass to addConnectedUser
				console.log("pre-room fetch");
				if (
					!this.server ||
					!this.server.sockets ||
					!this.server.sockets.adapter ||
					!this.server.sockets.adapter.rooms
				) {
					console.error("One of the required properties is undefined:", {
						server: !!this.server,
						sockets: !!this.server?.sockets,
						adapter: !!this.server?.sockets?.adapter,
						rooms: !!this.server?.sockets?.adapter?.rooms,
					});
					await this.roomUsers.addConnectedUser(client.id, payload.userID);
					await this.dmUsers.addConnectedUser(client.id, payload.userID);
				} else {
					const clientsSet: Set<string> | undefined =
						this.server.sockets.adapter.rooms.get(client.id);
					console.log("post-room fetch");
					if (!clientsSet) {
						throw new Error("No connected clients found");
					}
					const connectedClients: string[] = [...clientsSet];
					for (const c of connectedClients) {
						await this.roomUsers.addConnectedUser(c, payload.userID);
						await this.dmUsers.addConnectedUser(c, payload.userID);
					}
				}
				const response: ChatEventDto = {
					userID: null,
					date_created: new Date(),
				};
				client.join(payload.userID);
				this.server.emit(SOCKET_EVENTS.CONNECTED, response);
				console.log("Response emitted: " + SOCKET_EVENTS.CONNECTED);
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error as Error);
			}
		});
	}

	/*
	@SubscribeMessage(SOCKET_EVENTS.DISCONNECT_USER)
	async handleLeaveRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		try {
			//this.server.emit();
		} catch (error) {
			console.error(error);
			this.handleThrownError(client, error as Error);
		}
	}
	*/

	/*
	@SubscribeMessage(SOCKET_EVENTS.ERROR)
	async handleError(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		try {
			//this.server.emit();
		} catch (error) {
			console.error(error);
			this.handleThrownError(client, error as Error);
		}
	}
	*/

	/* **************************************************************************************** */

	@SubscribeMessage(SOCKET_EVENTS.LIVE_MESSAGE)
	async handleLiveMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(SOCKET_EVENTS.LIVE_MESSAGE, async () => {
			try {
				/*
				validate auth

				get room id
				if room does not exist
					return error

				create message
				emit to room: LIVE_MESSAGE, { message: payload.message }
				*/

				//auth

				const payload: ChatEventDto = await this.validateChatEvent(p);
				if (!payload.userID) {
					throw new Error("No userID provided");
				}

				if (!payload.body) {
					throw new Error("No body provided");
				}
				const roomID: string = payload.body.roomID;
				if (!roomID) {
					throw new Error("No roomID provided");
				}
				if (!this.dbUtils.roomExists(roomID)) {
					throw new Error("Room does not exist");
				}

				const message: LiveChatMessageDto = payload.body;
				const messageID: string = await this.roomService.createLiveChatMessage(
					message,
					payload.userID,
				);
				const finalMessage: LiveChatMessageDto =
					await this.dtogen.generateLiveChatMessageDto(messageID);
				const response: ChatEventDto = {
					userID: finalMessage.sender.userID,
					date_created: new Date(),
					body: finalMessage,
				};
				this.server.to(roomID).emit(SOCKET_EVENTS.LIVE_MESSAGE, response);
				console.log("Response emitted: " + SOCKET_EVENTS.LIVE_MESSAGE);
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error as Error);
			}
		});
	}

	@SubscribeMessage(SOCKET_EVENTS.GET_LIVE_CHAT_HISTORY)
	async handleGetLiveChatHistory(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(
			SOCKET_EVENTS.GET_LIVE_CHAT_HISTORY,
			async () => {
				try {
					//this.server.emit();
					/*
				validate auth

				get room id
				if room does not exist
					return error

				get chat history
				emit to socket: LIVE_MESSAGE, { message: chatHistory }
				*/

					//auth

					const payload: ChatEventDto = await this.validateChatEvent(p);
					if (!payload.userID) {
						throw new Error("No userID provided");
					}

					if (!payload.body) {
						throw new Error("No body provided");
					}
					const roomID: string = payload.body.roomID;
					if (!roomID) {
						throw new Error("No roomID provided");
					}
					if (!this.dbUtils.roomExists(roomID)) {
						throw new Error("Room does not exist");
					}

					const messages: LiveChatMessageDto[] =
						await this.roomService.getLiveChatHistoryDto(roomID);
					this.server.emit(SOCKET_EVENTS.LIVE_CHAT_HISTORY, messages);
					console.log("Response emitted: " + SOCKET_EVENTS.LIVE_CHAT_HISTORY);
				} catch (error) {
					console.error(error);
					this.handleThrownError(client, error as Error);
				}
			},
		);
	}

	@SubscribeMessage(SOCKET_EVENTS.JOIN_ROOM)
	async handleJoinRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(SOCKET_EVENTS.JOIN_ROOM, async () => {
			try {
				//this.server.emit();
				/*
				validate auth

				get room id
				if room does not exist
					return error

				add user to room data structure
				add user to socket room
				emit to room: USER_JOINED, { userId: user.id }
				*/

				//auth

				const payload: ChatEventDto = await this.validateChatEvent(p);
				if (!payload.userID) {
					throw new Error("No userID provided");
				}

				if (!payload.body) {
					throw new Error("No body provided");
				}
				const roomID: string = payload.body.roomID;
				if (!roomID) {
					throw new Error("No roomID provided");
				}
				if (!this.dbUtils.roomExists(roomID)) {
					throw new Error("Room does not exist");
				}

				await this.roomUsers.setRoomId(client.id, roomID);
				client.join(roomID);
				const joinAnnouncement: ChatEventDto = {
					userID: payload.userID,
					date_created: new Date(),
				};
				this.server
					.to(roomID)
					.emit(SOCKET_EVENTS.USER_JOINED_ROOM, joinAnnouncement);
				console.log("Response emitted: " + SOCKET_EVENTS.USER_JOINED_ROOM);

				// if (!(await this.roomQueue.isPlaying(roomID))) {
				// 	await this.roomQueue.play(roomID);
				// }
				if (await this.roomQueue.isPlaying(roomID)) {
					await this.sendMediaState(roomID);
				}
				await this.sendQueueState(roomID);
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error as Error);
			}
		});
	}

	@SubscribeMessage(SOCKET_EVENTS.LEAVE_ROOM)
	async handleLeaveRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(SOCKET_EVENTS.LEAVE_ROOM, async () => {
			try {
				//auth

				const payload: ChatEventDto = await this.validateChatEvent(p);
				if (!payload.userID) {
					throw new Error("No userID provided");
				}

				const roomID = this.roomUsers.getRoomId(client.id);
				if (!roomID) {
					throw new Error("User is not in a room");
				}
				if (!this.dbUtils.roomExists(roomID)) {
					throw new Error("Room does not exist");
				}

				if ((await this.roomService.getRoomUserCount(roomID)) === 1) {
					await this.roomQueue.pauseSong(roomID);
				}

				const response: ChatEventDto = {
					userID: payload.userID,
					date_created: new Date(),
				};
				this.server.to(roomID).emit(SOCKET_EVENTS.USER_LEFT_ROOM, response);
				console.log("Response emitted: " + SOCKET_EVENTS.USER_LEFT_ROOM);
				await this.roomUsers.leaveRoom(client.id);
				client.leave(roomID);
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error as Error);
			}
		});
	}

	@SubscribeMessage(SOCKET_EVENTS.EMOJI_REACTION)
	async handleEmojiReaction(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(
			SOCKET_EVENTS.EMOJI_REACTION,
			async () => {
				try {
					console.log(p);
					let r: EmojiReactionDto;
					try {
						const j = JSON.parse(p);
						r = j as EmojiReactionDto;
					} catch (e) {
						console.error(e);
						throw new Error("Invalid JSON received");
					}
					const roomID = this.roomUsers.getRoomId(client.id);
					if (!roomID) {
						throw new Error("User is not in a room");
					}
					await this.roomService.saveReaction(roomID, r);
					this.server.to(roomID).emit(SOCKET_EVENTS.EMOJI_REACTION, r);
				} catch (error) {
					console.error(error);
					this.handleThrownError(client, error as Error);
				}
			},
		);
	}
	/* **************************************************************************************** */

	@SubscribeMessage(SOCKET_EVENTS.DIRECT_MESSAGE)
	async handleDirectMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(
			SOCKET_EVENTS.DIRECT_MESSAGE,
			async () => {
				try {
					console.log(p);
					let payload: DirectMessageDto;
					try {
						const j = JSON.parse(p);
						payload = j as DirectMessageDto;
					} catch (e) {
						console.error(e);
						throw new Error("Invalid JSON received");
					}

					const chatID: string | null = await this.dmUsers.getChatID(client.id);
					if (!chatID) {
						throw new Error("User is not in a DM chat");
					}

					const user: UserDto | null = await this.dmUsers.getUser(client.id);
					if (!user) {
						throw new Error("User not found in DM chat");
					}

					console.log("user: " + user);
					console.log("chatID: " + chatID);
					const finalMessage: DirectMessageDto =
						await this.userService.sendMessage(payload);
					this.server
						.to(chatID)
						.emit(SOCKET_EVENTS.DIRECT_MESSAGE, finalMessage);
				} catch (error) {
					console.error(error);
					this.handleThrownError(client, error as Error);
				}
			},
		);
	}

	@SubscribeMessage(SOCKET_EVENTS.GET_DIRECT_MESSAGE_HISTORY)
	async handleGetDirectMessageHistory(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(
			SOCKET_EVENTS.GET_DIRECT_MESSAGE_HISTORY,
			async () => {
				try {
					console.log(p);
					let payload: { userID: string; participantID: string };
					try {
						const j = JSON.parse(p);
						payload = j as { userID: string; participantID: string };
					} catch (e) {
						console.error(e);
						throw new Error("Invalid JSON received");
					}
					const messages: DirectMessageDto[] =
						await this.userService.getMessages(
							payload.userID,
							payload.participantID,
						);
					let chatID: string | null = await this.dmUsers.getChatID(client.id);
					if (!chatID) {
						await this.dmUsers.setChatInfo(client.id, payload.participantID);
						chatID = await this.dmUsers.getChatID(client.id);
						if (!chatID) {
							throw new Error("Chat ID was not set for some reason");
						}
						client.join(chatID);
					}
					this.server.to(chatID).emit(SOCKET_EVENTS.DM_HISTORY, messages);
					console.log("Response emitted: " + SOCKET_EVENTS.DM_HISTORY);
				} catch (error) {
					console.error(error);
					this.handleThrownError(client, error as Error);
				}
			},
		);
	}

	@SubscribeMessage(SOCKET_EVENTS.TYPING)
	async handleTyping(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(SOCKET_EVENTS.TYPING, async () => {
			try {
				console.log(p);
				/*
				let payload: { userID: string; participantID: string };
				try {
					const j = JSON.parse(p);
					payload = j as { userID: string; participantID: string };
				} catch (e) {
					console.error(e);
					throw new Error("Invalid JSON received");
				}
					*/

				const chatID: string | null = await this.dmUsers.getChatID(client.id);
				if (!chatID) {
					throw new Error("User is not in a DM chat");
				}

				const user: UserDto | null = await this.dmUsers.getUser(client.id);
				if (!user) {
					throw new Error("User not found in DM chat");
				}

				const typingAnnouncement = {
					userID: user.userID,
				};
				this.server.to(chatID).emit(SOCKET_EVENTS.TYPING, typingAnnouncement);
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error as Error);
			}
		});
	}

	@SubscribeMessage(SOCKET_EVENTS.STOP_TYPING)
	async handleStopTyping(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(SOCKET_EVENTS.STOP_TYPING, async () => {
			try {
				console.log(p);
				/*
				let payload: { userID: string; participantID: string };
				try {
					const j = JSON.parse(p);
					payload = j as { userID: string; participantID: string };
				} catch (e) {
					console.error(e);
					throw new Error("Invalid JSON received");
				}
					*/

				const chatID: string | null = await this.dmUsers.getChatID(client.id);
				if (!chatID) {
					throw new Error("User is not in a DM chat");
				}

				const user: UserDto | null = await this.dmUsers.getUser(client.id);
				if (!user) {
					throw new Error("User not found in DM chat");
				}

				const stopTypingAnnouncement = {
					userID: user.userID,
				};
				this.server
					.to(chatID)
					.emit(SOCKET_EVENTS.TYPING, stopTypingAnnouncement);
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error as Error);
			}
		});
	}

	@SubscribeMessage(SOCKET_EVENTS.ENTER_DM)
	async handleEnterDM(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(SOCKET_EVENTS.ENTER_DM, async () => {
			try {
				console.log(p);
				let enterPayload: { userID: string; participantID: string };
				try {
					const j = JSON.parse(p);
					enterPayload = j as { userID: string; participantID: string };
				} catch (e) {
					console.error(e);
					throw new Error("Invalid JSON received");
				}

				await this.dmUsers.setChatInfo(client.id, enterPayload.participantID);
				const chatID: string | null = await this.dmUsers.getChatID(client.id);
				if (!chatID) {
					throw new Error("Chat ID was not set for some reason");
				}
				client.join(chatID);
				const onlineAnnouncement = {
					userID: enterPayload.userID,
				};
				this.server
					.to(chatID)
					.emit(SOCKET_EVENTS.USER_ONLINE, onlineAnnouncement);
				console.log("Response emitted: " + SOCKET_EVENTS.USER_ONLINE);
				const messages: DirectMessageDto[] = await this.userService.getMessages(
					enterPayload.userID,
					enterPayload.participantID,
				);
				this.server.to(chatID).emit(SOCKET_EVENTS.DM_HISTORY, messages);
				console.log("Response emitted: " + SOCKET_EVENTS.DM_HISTORY);
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error as Error);
			}
		});
	}

	@SubscribeMessage(SOCKET_EVENTS.EXIT_DM)
	async handleExitDM(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(SOCKET_EVENTS.EXIT_DM, async () => {
			try {
				console.log(p);
				const chatID: string | null = await this.dmUsers.getChatID(client.id);
				if (!chatID) {
					throw new Error("User is not in a DM chat");
				}

				const user: UserDto | null = await this.dmUsers.getUser(client.id);
				if (!user) {
					throw new Error("User not found in DM chat");
				}

				await this.dmUsers.disconnectChat(client.id);
				const offlineAnnouncement = {
					userID: user.userID,
				};
				this.server
					.to(chatID)
					.emit(SOCKET_EVENTS.USER_OFFLINE, offlineAnnouncement);
				console.log("Response emitted: " + SOCKET_EVENTS.USER_OFFLINE);
				client.leave(chatID);
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error as Error);
			}
		});
	}

	@SubscribeMessage(SOCKET_EVENTS.MODIFY_DM)
	async handleModifyDM(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(SOCKET_EVENTS.MODIFY_DM, async () => {
			try {
				console.log(p);
				let payload: {
					userID: string;
					participantID: string;
					action: string;
					message: DirectMessageDto;
				};
				try {
					const j = JSON.parse(p);
					payload = j as {
						userID: string;
						participantID: string;
						action: string;
						message: DirectMessageDto;
					};
				} catch (e) {
					console.error(e);
					throw new Error("Invalid JSON received");
				}

				const chatID: string | null = await this.dmUsers.getChatID(client.id);
				if (!chatID) {
					throw new Error("User is not in a DM chat");
				}

				const user: UserDto | null = await this.dmUsers.getUser(client.id);
				if (!user) {
					throw new Error("User not found in DM chat");
				}

				if (payload.action === "edit") {
					const edited: DirectMessageDto = await this.userService.editMessage(
						payload.message,
					);
					this.server.to(chatID).emit(SOCKET_EVENTS.CHAT_MODIFIED, {
						userID: user.userID,
						participantID: payload.participantID,
						action: "edit",
						message: edited,
					});
				} else if (payload.action === "delete") {
					let deletedMessage: DirectMessageDto;
					try {
						deletedMessage = await this.dtogen.generateDirectMessageDto(
							payload.message.pID,
						);
					} catch (e) {
						console.error(e);
						throw new Error("Message does not exist");
					}

					const deleted = await this.userService.deleteMessage(deletedMessage);
					if (!deleted) {
						throw new Error("Message could not be deleted");
					}
					this.server.to(chatID).emit(SOCKET_EVENTS.CHAT_MODIFIED, {
						userID: user.userID,
						participantID: payload.participantID,
						action: "delete",
						message: deletedMessage,
					});
				} else {
					throw new Error("Invalid action");
				}
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error as Error);
			}
		});
	}

	/* **************************************************************************************** */

	@SubscribeMessage(SOCKET_EVENTS.PING)
	async handlePing(@ConnectedSocket() client: Socket): Promise<Date> {
		console.log("Received event: ping");
		if (!client)
			throw new Error("This is a stub because client should always be defined");
		return new Date();
	}

	// for determining client and server clock latency
	@SubscribeMessage("time_sync")
	handleTimeSync(
		@ConnectedSocket() client: Socket,
		@MessageBody() data: { t0: number },
	) {
		const t1 = Date.now();
		client.emit("time_sync_response", { t0: data.t0, t1, t2: Date.now() });
	}

	/* **************************************************************************************** */

	/*
	//synchronised media playback
	PLAY_MEDIA: "playMedia",
	PAUSE_MEDIA: "pauseMedia",
	STOP_MEDIA: "stopMedia",
	SEEK_MEDIA: "seekMedia",
	CURRENT_MEDIA: "currentMedia",
	QUEUE_STATE: "queueState",
	MEDIA_SYNC: "mediaSync",
	*/

	@SubscribeMessage(SOCKET_EVENTS.INIT_PLAY)
	async handleInitPlayMedia(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(SOCKET_EVENTS.INIT_PLAY, async () => {
			try {
				console.log(p);
				const payload: PlaybackEventDto = await this.validatePlaybackEvent(p);
				if (!payload.UTC_time || payload.UTC_time === null) {
					throw new Error("No UTC_time provided");
				}

				const roomID: string | null = this.roomUsers.getRoomId(client.id);
				if (roomID === null) {
					throw new Error("User is not in a room");
				}

				//{check user permissions}
				const song: RoomSongDto | null = await this.roomQueue.play(
					roomID,
					payload.UTC_time,
				);
				console.log("Song to play: " + song);
				if (song === null) {
					throw new Error("No song is queued");
				}
				const startTime: number | undefined = song.startTime;
				if (startTime === undefined) {
					throw new Error("No start time for song");
				}
				const response: PlaybackEventDto = {
					date_created: new Date(),
					userID: null,
					roomID: roomID,
					spotifyID: song.spotifyID,
					UTC_time: startTime,
				};
				this.server.to(roomID).emit(SOCKET_EVENTS.PLAY_MEDIA, response);
				await this.sendQueueState(roomID);
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error as Error);
			}
		});
	}

	@SubscribeMessage(SOCKET_EVENTS.INIT_PAUSE)
	async handleInitPauseMedia(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		console.log("Received event: " + SOCKET_EVENTS.INIT_PAUSE);
		try {
			console.log(p);

			const roomID: string | null = this.roomUsers.getRoomId(client.id);
			if (roomID === null) {
				throw new Error("User is not in a room");
			}

			//{check user permissions}

			if (await this.roomQueue.isPlaying(roomID)) {
				/*
				await this.roomQueue.pauseSong(roomID);
				const response: PlaybackEventDto = {
					date_created: new Date(),
					userID: null,
					roomID: roomID,
					songID: null,
					UTC_time: null,
				};
				this.server.to(roomID).emit(SOCKET_EVENTS.PAUSE_MEDIA, response);
				*/
			}
			await this.roomQueue.pauseSong(roomID);
			const song: RoomSongDto | null = await this.roomQueue.getCurrentSong(
				roomID,
			);
			console.log("Paused song: " + song);
			if (song === null) {
				throw new Error("No song is queued");
			}
			const startTime: number | undefined = song.startTime;
			if (startTime === undefined) {
				throw new Error("No start time for song");
			}
			const response: PlaybackEventDto = {
				date_created: new Date(),
				userID: null,
				roomID: roomID,
				spotifyID: song.spotifyID,
				UTC_time: startTime,
			};
			this.server.to(roomID).emit(SOCKET_EVENTS.PAUSE_MEDIA, response);
			await this.sendQueueState(roomID);
		} catch (error) {
			console.error(error);
			this.handleThrownError(client, error as Error);
		}
	}

	// @SubscribeMessage(SOCKET_EVENTS.INIT_STOP)
	// async handleInitStopMedia(
	// 	@ConnectedSocket() client: Socket,
	// 	@MessageBody() p: string,
	// ): Promise<void> {
	// 	this.eventQueueService.addToQueue(SOCKET_EVENTS.INIT_STOP, async () => {
	// 			// 		console.log("Received event: " + SOCKET_EVENTS.INIT_STOP);
	// 		try {
	// 			//this.server.emit();
	// 			console.log(p);

	// 			const roomID: string | null = this.roomUsers.getRoomId(client.id);
	// 			if (roomID === null) {
	// 				throw new Error("User is not in a room");
	// 			}

	// 			//{check user permissions}

	// 			if (await this.roomQueue.isPlaying(roomID)) {
	// 				/*
	// 				await this.roomQueue.stopSong(roomID);
	// 				const response: PlaybackEventDto = {
	// 					date_created: new Date(),
	// 					userID: null,
	// 					roomID: roomID,
	// 					songID: null,
	// 					UTC_time: null,
	// 				};
	// 				this.server.to(roomID).emit(SOCKET_EVENTS.STOP_MEDIA, response);
	// 				*/
	// 			}
	// 		} catch (error) {
	// 			console.error(error);
	// 			this.handleThrownError(client, error as Error);
	// 		}
	// 	});
	// }

	@SubscribeMessage(SOCKET_EVENTS.INIT_SKIP)
	async handleInitSkipMedia(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(SOCKET_EVENTS.INIT_SKIP, async () => {
			try {
				console.log(p);
				const payload: PlaybackEventDto = await this.validatePlaybackEvent(p);
				if (!payload.UTC_time || payload.UTC_time === null) {
					throw new Error("No UTC_time provided");
				}

				const roomID: string | null = this.roomUsers.getRoomId(client.id);
				if (roomID === null) {
					throw new Error("User is not in a room");
				}

				//{check user permissions}

				await this.roomQueue.playNext(roomID, payload.UTC_time);
				let song: RoomSongDto | null = await this.roomQueue.getCurrentSong(
					roomID,
				);
				console.log("Song to play: " + song);
				if (song === null) {
					throw new Error("No song is queued");
				}
				let startTime: number | undefined = song.startTime;
				if (startTime === undefined) {
					song = await this.roomQueue.play(roomID, payload.UTC_time);
					if (song === null) {
						throw new Error("No song is queued");
					}
				}
				startTime = song.startTime;
				if (startTime === undefined) {
					throw new Error("No start time for song. Very weird error");
				}

				const response: PlaybackEventDto = {
					date_created: new Date(),
					userID: null,
					roomID: roomID,
					spotifyID: song.spotifyID,
					UTC_time: startTime,
				};
				this.server.to(roomID).emit(SOCKET_EVENTS.PLAY_MEDIA, response);
				await this.sendQueueState(roomID);
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error as Error);
			}
		});
	}

	// @SubscribeMessage(SOCKET_EVENTS.INIT_PREV)
	// async handleInitPrevMedia(
	// 	@ConnectedSocket() client: Socket,
	// 	@MessageBody() p: string,
	// ): Promise<void> {
	// 	this.eventQueueService.addToQueue(SOCKET_EVENTS.INIT_PREV, async () => {
	// 		try {
	// 			console.log(p);
	// 			const payload: PlaybackEventDto = await this.validatePlaybackEvent(p);
	// 			if (!payload.UTC_time || payload.UTC_time === null) {
	// 				throw new Error("No UTC_time provided");
	// 			}

	// 			const roomID: string | null = this.roomUsers.getRoomId(client.id);
	// 			if (roomID === null) {
	// 				throw new Error("User is not in a room");
	// 			}

	// 			//{check user permissions}
	// 			await this.roomQueue.playPrev(roomID, payload.UTC_time);
	// 			let song: RoomSongDto | null = await this.roomQueue.getCurrentSong(
	// 				roomID,
	// 			);
	// 			console.log("Song to play: " + song);
	// 			if (song === null) {
	// 				throw new Error("No song is queued");
	// 			}
	// 			let startTime: number | undefined = song.startTime;
	// 			if (startTime === undefined) {
	// 				song = await this.roomQueue.play(roomID, payload.UTC_time);
	// 				if (song === null) {
	// 					throw new Error("No song is queued");
	// 				}
	// 			}
	// 			startTime = song.startTime;
	// 			if (startTime === undefined) {
	// 				throw new Error("No start time for song. Very weird error");
	// 			}

	// 			const response: PlaybackEventDto = {
	// 				date_created: new Date(),
	// 				userID: null,
	// 				roomID: roomID,
	// 				spotifyID: song.spotifyID,
	// 				UTC_time: startTime,
	// 			};
	// 			this.server.to(roomID).emit(SOCKET_EVENTS.PLAY_MEDIA, response);
	// 			await this.sendQueueState(roomID);
	// 		} catch (error) {
	// 			console.error(error);
	// 			this.handleThrownError(client, error as Error);
	// 		}
	// 	});
	// }

	// @SubscribeMessage(SOCKET_EVENTS.SEEK_MEDIA)
	// async handleSeekMedia(
	// 	@ConnectedSocket() client: Socket,
	// 	@MessageBody() p: string,
	// ): Promise<void> {
	// 	this.eventQueueService.addToQueue(async () => {
	// 		try {
	// 			//this.server.emit();
	// 			console.log(p);
	// 		} catch (error) {
	// 			console.error(error);
	// 			this.handleThrownError(client, error as Error);
	// 		}
	// 	});
	// }

	@SubscribeMessage(SOCKET_EVENTS.CURRENT_MEDIA)
	async handleCurrentMedia(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(SOCKET_EVENTS.CURRENT_MEDIA, async () => {
			try {
				console.log(p);
				const roomID: string | null = this.roomUsers.getRoomId(client.id);
				if (roomID === null) {
					throw new Error("User is not in a room");
				}

				//{check user permissions}
				await this.sendMediaState(roomID);
				await this.sendQueueState(roomID);
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error as Error);
			}
		});
	}

	// @SubscribeMessage(SOCKET_EVENTS.MEDIA_SYNC)
	// async handleMediaSync(
	// 	@ConnectedSocket() client: Socket,
	// 	@MessageBody() p: string,
	// ): Promise<void> {
	// 	this.eventQueueService.addToQueue(SOCKET_EVENTS.MEDIA_SYNC, async () => {
	// 		try {
	// 			//this.server.emit();
	// 			console.log(p);
	// 		} catch (error) {
	// 			console.error(error);
	// 			this.handleThrownError(client, error as Error);
	// 		}
	// 	});
	// }

	// @SubscribeMessage(SOCKET_EVENTS.UPVOTE_SONG)
	// async handleSongUpvote(
	// 	@ConnectedSocket() client: Socket,
	// 	@MessageBody() p: string,
	// ): Promise<void> {
	// 	this.eventQueueService.addToQueue(SOCKET_EVENTS.UPVOTE_SONG, async () => {
	// 		try {
	// 			console.log(p);
	// 			const payload: QueueEventDto = await this.validateQueueEvent(p, true);
	// 			if (!payload.createdAt) {
	// 				throw new Error("No createdAt provided");
	// 			}
	// 			const somethingChanged: boolean = await this.roomQueue.upvoteSong(
	// 				payload.roomID,
	// 				payload.songs[0].spotifyID,
	// 				payload.songs[0].userID,
	// 				payload.createdAt,
	// 			);
	// 			if (somethingChanged) {
	// 				const song = await this.roomQueue.getSongAsRoomSongDto(
	// 					payload.roomID,
	// 					payload.songs[0].spotifyID,
	// 				);
	// 				if (song) {
	// 					const response: QueueEventDto = {
	// 						roomID: payload.roomID,
	// 						songs: [song],
	// 					};
	// 					this.server
	// 						.to(payload.roomID)
	// 						.emit(SOCKET_EVENTS.VOTE_UPDATED, response);
	// 					console.log("Response emitted: " + SOCKET_EVENTS.VOTE_UPDATED);
	// 					this.sendQueueState(payload.roomID);
	// 				}
	// 			}
	// 		} catch (error) {
	// 			console.error(error);
	// 			this.handleThrownError(client, error);
	// 		}
	// 	});
	// }

	// @SubscribeMessage(SOCKET_EVENTS.DOWNVOTE_SONG)
	// async handleSongDownvote(
	// 	@ConnectedSocket() client: Socket,
	// 	@MessageBody() p: string,
	// ): Promise<void> {
	// 	this.eventQueueService.addToQueue(SOCKET_EVENTS.DOWNVOTE_SONG, async () => {
	// 		try {
	// 			console.log(p);
	// 			const payload: QueueEventDto = await this.validateQueueEvent(p, true);
	// 			if (!payload.createdAt) {
	// 				throw new Error("No createdAt provided");
	// 			}
	// 			const somethingChanged: boolean = await this.roomQueue.downvoteSong(
	// 				payload.roomID,
	// 				payload.songs[0].spotifyID,
	// 				payload.songs[0].userID,
	// 				payload.createdAt,
	// 			);
	// 			if (somethingChanged) {
	// 				const song = await this.roomQueue.getSongAsRoomSongDto(
	// 					payload.roomID,
	// 					payload.songs[0].spotifyID,
	// 				);
	// 				if (song) {
	// 					const response: QueueEventDto = {
	// 						roomID: payload.roomID,
	// 						songs: [song],
	// 					};
	// 					this.server
	// 						.to(payload.roomID)
	// 						.emit(SOCKET_EVENTS.VOTE_UPDATED, response);
	// 					console.log("Response emitted: " + SOCKET_EVENTS.VOTE_UPDATED);
	// 					this.sendQueueState(payload.roomID);
	// 				}
	// 			}
	// 		} catch (error) {
	// 			console.error(error);
	// 			this.handleThrownError(client, error);
	// 		}
	// 	});
	// }

	// @SubscribeMessage(SOCKET_EVENTS.UNDO_SONG_VOTE)
	// async handleVoteUndo(
	// 	@ConnectedSocket() client: Socket,
	// 	@MessageBody() p: string,
	// ): Promise<void> {
	// 	this.eventQueueService.addToQueue(
	// 		SOCKET_EVENTS.UNDO_SONG_VOTE,
	// 		async () => {
	// 			try {
	// 				console.log(p);
	// 				const payload: QueueEventDto = await this.validateQueueEvent(p);
	// 				const somethingChanged: boolean = await this.roomQueue.undoSongVote(
	// 					payload.roomID,
	// 					payload.songs[0].spotifyID,
	// 					payload.songs[0].userID,
	// 				);
	// 				if (somethingChanged) {
	// 					const song = await this.roomQueue.getSongAsRoomSongDto(
	// 						payload.roomID,
	// 						payload.songs[0].spotifyID,
	// 					);
	// 					if (song) {
	// 						const response: QueueEventDto = {
	// 							roomID: payload.roomID,
	// 							songs: [song],
	// 						};
	// 						this.server
	// 							.to(payload.roomID)
	// 							.emit(SOCKET_EVENTS.VOTE_UPDATED, response);
	// 						console.log("Response emitted: " + SOCKET_EVENTS.VOTE_UPDATED);
	// 						this.sendQueueState(payload.roomID);
	// 					}
	// 				}
	// 			} catch (error) {
	// 				console.error(error);
	// 				this.handleThrownError(client, error);
	// 			}
	// 		},
	// 	);
	// }

	// @SubscribeMessage(SOCKET_EVENTS.SWAP_SONG_VOTE)
	// async handleVoteSwap(
	// 	@ConnectedSocket() client: Socket,
	// 	@MessageBody() p: string,
	// ): Promise<void> {
	// 	this.eventQueueService.addToQueue(
	// 		SOCKET_EVENTS.SWAP_SONG_VOTE,
	// 		async () => {
	// 			try {
	// 				console.log(p);
	// 				const payload: QueueEventDto = await this.validateQueueEvent(p, true);
	// 				if (!payload.createdAt) {
	// 					throw new Error("No createdAt provided");
	// 				}
	// 				const somethingChanged: boolean = await this.roomQueue.swapSongVote(
	// 					payload.roomID,
	// 					payload.songs[0].spotifyID,
	// 					payload.songs[0].userID,
	// 					payload.createdAt,
	// 				);
	// 				if (somethingChanged) {
	// 					const song = await this.roomQueue.getSongAsRoomSongDto(
	// 						payload.roomID,
	// 						payload.songs[0].spotifyID,
	// 					);
	// 					if (song) {
	// 						const response: QueueEventDto = {
	// 							roomID: payload.roomID,
	// 							songs: [song],
	// 						};
	// 						this.server
	// 							.to(payload.roomID)
	// 							.emit(SOCKET_EVENTS.VOTE_UPDATED, response);
	// 						console.log("Response emitted: " + SOCKET_EVENTS.VOTE_UPDATED);
	// 						this.sendQueueState(payload.roomID);
	// 					}
	// 				}
	// 			} catch (error) {
	// 				console.error(error);
	// 				this.handleThrownError(client, error);
	// 			}
	// 		},
	// 	);
	// }

	@SubscribeMessage(SOCKET_EVENTS.ENQUEUE_SONG)
	async handleSongEnqueue(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(SOCKET_EVENTS.ENQUEUE_SONG, async () => {
			try {
				console.log(p);
				const payload: QueueEventDto = await this.validateQueueEvent(p, true);
				const userID: string | null = this.roomUsers.getUserId(client.id);
				if (userID === null) {
					throw new Error("User is not in a room");
				}
				const somethingChanged: boolean = await this.roomQueue.addSongs(
					payload.roomID,
					userID,
					payload.songs,
				);
				if (somethingChanged) {
					const queueState: {
						room: RoomDto;
						songs: RoomSongDto[];
						votes: VoteDto[];
					} = await this.roomQueue.getQueueState(payload.roomID);
					const newSongs: RoomSongDto[] = queueState.songs.filter((s) =>
						payload.songs.some((p) => p.spotifyID === s.spotifyID),
					);
					if (newSongs.length > 0) {
						const response: QueueEventDto = {
							roomID: payload.roomID,
							songs: newSongs,
						};
						this.server
							.to(payload.roomID)
							.emit(SOCKET_EVENTS.SONG_ADDED, response);
						console.log("Response emitted: " + SOCKET_EVENTS.SONG_ADDED);
					}
				}
				this.sendQueueState(payload.roomID);
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error);
			}
		});
	}

	@SubscribeMessage(SOCKET_EVENTS.DEQUEUE_SONG)
	async handleSongDequeue(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(SOCKET_EVENTS.DEQUEUE_SONG, async () => {
			try {
				console.log(p);
				const payload: QueueEventDto = await this.validateQueueEvent(p);
				const userID: string | null = this.roomUsers.getUserId(client.id);
				if (userID === null) {
					throw new Error("User is not in a room");
				}
				const somethingChanged: boolean = await this.roomQueue.removeSongs(
					payload.roomID,
					userID,
					payload.songs,
				);
				if (somethingChanged) {
					const queueState: {
						room: RoomDto;
						songs: RoomSongDto[];
						votes: VoteDto[];
					} = await this.roomQueue.getQueueState(payload.roomID);
					const newSongs: RoomSongDto[] = queueState.songs.filter((s) =>
						payload.songs.some((p) => p.spotifyID === s.spotifyID),
					);
					if (newSongs.length > 0) {
						const response: QueueEventDto = {
							roomID: payload.roomID,
							songs: newSongs,
						};
						this.server
							.to(payload.roomID)
							.emit(SOCKET_EVENTS.SONG_REMOVED, response);
						console.log("Response emitted: " + SOCKET_EVENTS.SONG_REMOVED);
					}
				}
				this.sendQueueState(payload.roomID);
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error);
			}
		});
	}

	@SubscribeMessage(SOCKET_EVENTS.REQUEST_QUEUE)
	async handleRequestQueueState(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(SOCKET_EVENTS.REQUEST_QUEUE, async () => {
			try {
				console.log(p);
				const obj: { roomID: string } = JSON.parse(p) as { roomID: string };
				await this.sendQueueState(obj.roomID);
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error);
			}
		});
	}

	async sendMediaState(roomID: string): Promise<void> {
		const song: RoomSongDto | null = await this.roomQueue.getCurrentSong(
			roomID,
		);
		if (song) {
			const startTime: number | undefined = await song.startTime;
			if (!startTime) {
				throw new Error("No song start time found somehow?");
			}
			const response: PlaybackEventDto = {
				date_created: new Date(),
				userID: null,
				roomID: roomID,
				spotifyID: song.spotifyID,
				song: song,
				UTC_time: startTime,
			};
			this.server.to(roomID).emit(SOCKET_EVENTS.CURRENT_MEDIA, response);
			console.log("Response emitted: " + SOCKET_EVENTS.CURRENT_MEDIA);
		}
	}

	async sendQueueState(roomID: string): Promise<void> {
		const queueState: {
			room: RoomDto;
			songs: RoomSongDto[];
			votes: VoteDto[];
		} = await this.roomQueue.getQueueState(roomID);
		this.server.to(roomID).emit(SOCKET_EVENTS.QUEUE_STATE, queueState);
		console.log("Response emitted: " + SOCKET_EVENTS.QUEUE_STATE);
	}
	/* **************************************************************************************** */

	async validateChatEvent(payload: string): Promise<ChatEventDto> {
		/*
		if no token, return error
		if token
			if token is not valid
				return error
		*/
		let p: ChatEventDto;
		try {
			const j = JSON.parse(payload);
			p = j as ChatEventDto;
		} catch (e) {
			console.error(e);
			throw new Error("Invalid JSON received");
		}
		if (!p.userID) {
			throw new Error("No userID provided");
		}

		const result: ChatEventDto = {
			userID: p.userID,
		};
		if (p.date_created) {
			result.date_created = p.date_created;
		}
		if (p.body) {
			result.body = p.body;
		}
		if (p.errorMessage) {
			throw new Error("errorMessage is not a valid field for input events.");
		}
		return result;
	}

	async validateQueueEvent(
		payload: string,
		dateRequired = false,
	): Promise<QueueEventDto> {
		/*
		if no token, return error
		if token
			if token is not valid
				return error
		*/
		let q: QueueEventDto;
		try {
			console.log(`Payload: "${payload}"`);
			const j = JSON.parse(payload);
			q = j as QueueEventDto;
		} catch (e) {
			console.error(e);
			throw new Error("Invalid JSON received");
		}
		if (!q.roomID) {
			throw new Error("No 'userID' provided");
		}
		if (dateRequired && !q.createdAt) {
			throw new Error("No 'createdAt' provided");
		}
		return q;
	}

	async validatePlaybackEvent(payload: string): Promise<PlaybackEventDto> {
		/*
		if no token, return error
		if token
			if token is not valid
				return error
		*/
		let p: PlaybackEventDto;
		try {
			console.log(`Payload: "${payload}"`);
			const j = JSON.parse(payload);
			p = j as PlaybackEventDto;
		} catch (e) {
			console.error(e);
			throw new Error("Invalid JSON received");
		}
		return p;
	}

	async handleThrownError(client: Socket, error: Error): Promise<void> {
		const errorResponse: ChatEventDto = {
			userID: null,
			date_created: new Date(),
			errorMessage: error.message,
		};
		client.emit(SOCKET_EVENTS.ERROR, errorResponse);
		console.log("Error emitted: " + SOCKET_EVENTS.ERROR);
	}
}
