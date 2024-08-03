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
import { LiveService } from "./live.service";
import { DmUsersService } from "./dmusers/dmusers.service";
import { UserProfileDto } from "archive/modules/profile/dto/userprofile.dto";
import { UserDto } from "src/modules/users/dto/user.dto";
import { DirectMessageDto } from "src/modules/users/dto/dm.dto";
import { UsersService } from "src/modules/users/users.service";

@WebSocketGateway({
	namespace: "/live",
	transports: ["websocket"],
	cors: {
		origin: "http://localhost:3000",
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
		private readonly liveService: LiveService,
		private readonly userService: UsersService,
	) {}

	@WebSocketServer() server: Server;

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	async handleConnection(client: Socket, ...args: any[]) {
		this.handOverSocketServer(this.server);
		console.log("Client connected with ID: " + client.id);
	}

	async handleDisconnect(client: Socket) {
		this.handOverSocketServer(this.server);
		console.log("Client (id: " + client.id + ") disconnected");
		this.roomUsers.removeConnectedUser(client.id);
	}

	@SubscribeMessage("message")
	async handleMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(async () => {
			this.handOverSocketServer(this.server);
			console.log(p);
			//Hello World
			this.server.emit("message", { response: "Hello World" });
		});
	}

	@SubscribeMessage(SOCKET_EVENTS.CONNECT)
	async handleAuth(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(async () => {
			this.handOverSocketServer(this.server);
			console.log("Received event: " + SOCKET_EVENTS.CONNECT);
			try {
				//auth
				const payload: ChatEventDto = await this.validateInputEvent(p);
				if (!payload.userID) {
					throw new Error("No userID provided");
				}
				await this.roomUsers.addConnectedUser(client.id, payload.userID);
				await this.dmUsers.addConnectedUser(client.id, payload.userID);
				const response: ChatEventDto = {
					userID: null,
					date_created: new Date(),
				};
				this.server.emit(SOCKET_EVENTS.CONNECTED, response);
				console.log("Response emitted: " + SOCKET_EVENTS.CONNECTED);
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error);
			}
		});
	}

	/*
	@SubscribeMessage(SOCKET_EVENTS.DISCONNECT)
	async handleLeaveRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		try {
			//this.server.emit();
		} catch (error) {
			console.error(error);
			this.handleThrownError(client, error);
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
			this.handleThrownError(client, error);
		}
	}
	*/

	/* **************************************************************************************** */

	@SubscribeMessage(SOCKET_EVENTS.LIVE_MESSAGE)
	async handleLiveMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(async () => {
			this.handOverSocketServer(this.server);
			console.log("Received event: " + SOCKET_EVENTS.LIVE_MESSAGE);
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

				const payload: ChatEventDto = await this.validateInputEvent(p);
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
				this.handleThrownError(client, error);
			}
		});
	}

	@SubscribeMessage(SOCKET_EVENTS.GET_LIVE_CHAT_HISTORY)
	async handleGetLiveChatHistory(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(async () => {
			this.handOverSocketServer(this.server);
			console.log("Received event: " + SOCKET_EVENTS.GET_LIVE_CHAT_HISTORY);
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

				const payload: ChatEventDto = await this.validateInputEvent(p);
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
				this.server.emit(SOCKET_EVENTS.CHAT_HISTORY, messages);
				console.log("Response emitted: " + SOCKET_EVENTS.CHAT_HISTORY);
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error);
			}
		});
	}

	@SubscribeMessage(SOCKET_EVENTS.JOIN_ROOM)
	async handleJoinRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(async () => {
			this.handOverSocketServer(this.server);
			console.log("Received event: " + SOCKET_EVENTS.JOIN_ROOM);
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

				const payload: ChatEventDto = await this.validateInputEvent(p);
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
					userID: null,
					date_created: new Date(),
				};
				this.server
					.to(roomID)
					.emit(SOCKET_EVENTS.USER_JOINED_ROOM, joinAnnouncement);
				console.log("Response emitted: " + SOCKET_EVENTS.USER_JOINED_ROOM);

				//send current media state
				if (await this.roomUsers.isPlaying(roomID)) {
					const songID: string | null =
						await this.roomUsers.getCurrentSong(roomID);
					if (songID) {
						const startTime: Date | null =
							await this.roomUsers.getCurrentSongStartTime(roomID);
						if (!startTime) {
							throw new Error("No song start time found somehow?");
						}
						const response: PlaybackEventDto = {
							date_created: new Date(),
							userID: null,
							roomID: roomID,
							songID: songID,
							UTC_time: startTime.getTime(),
						};
						client.emit(SOCKET_EVENTS.CURRENT_MEDIA, response);
						console.log("Response emitted: " + SOCKET_EVENTS.CURRENT_MEDIA);
					}
				}
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error);
			}
		});
	}

	@SubscribeMessage(SOCKET_EVENTS.LEAVE_ROOM)
	async handleLeaveRoom(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(async () => {
			this.handOverSocketServer(this.server);
			console.log("Received event: " + SOCKET_EVENTS.LEAVE_ROOM);
			try {
				//this.server.emit();
				/*
				validate auth

				get room id
				if room does not exist
					return error

				remove user from room data structure
				remove user from socket room
				emit to room: USER_LEFT, { userId: user.id }
				*/

				//auth

				const payload: ChatEventDto = await this.validateInputEvent(p);
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
					await this.roomUsers.stopSong(roomID);
				}

				const response: ChatEventDto = {
					userID: null,
					date_created: new Date(),
				};
				this.server.to(roomID).emit(SOCKET_EVENTS.USER_LEFT_ROOM, response);
				console.log("Response emitted: " + SOCKET_EVENTS.USER_LEFT_ROOM);
				await this.roomUsers.leaveRoom(client.id);
				client.leave(roomID);
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error);
			}
		});
	}

	/* **************************************************************************************** */

	@SubscribeMessage(SOCKET_EVENTS.DIRECT_MESSAGE)
	async handleDirectMessage(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(async () => {
			this.handOverSocketServer(this.server);
			console.log("Received event: " + SOCKET_EVENTS.DIRECT_MESSAGE);
			try {
				//this.server.emit();
				console.log(p);
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error);
			}
		});
	}

	@SubscribeMessage(SOCKET_EVENTS.GET_DIRECT_MESSAGE_HISTORY)
	async handleGetDirectMessageHistory(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(async () => {
			this.handOverSocketServer(this.server);
			console.log(
				"Received event: " + SOCKET_EVENTS.GET_DIRECT_MESSAGE_HISTORY,
			);
			try {
				console.log(p);
				//this.server.emit();
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error);
			}
		});
	}

	@SubscribeMessage(SOCKET_EVENTS.TYPING)
	async handleTyping(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(async () => {
			this.handOverSocketServer(this.server);
			console.log("Received event: " + SOCKET_EVENTS.TYPING);
			try {
				//this.server.emit();
				/*
				validate auth

				get room id
				if room does not exist
					return error

				emit to room: TYPING, { userId: user.id }
				*/
				console.log(p);
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error);
			}
		});
	}

	@SubscribeMessage(SOCKET_EVENTS.STOP_TYPING)
	async handleStopTyping(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(async () => {
			this.handOverSocketServer(this.server);
			console.log("Received event: " + SOCKET_EVENTS.STOP_TYPING);
			try {
				//this.server.emit();
				/*
				validate auth

				get room id
				if room does not exist
					return error

				emit to room: STOP_TYPING, { userId: user.id }
				*/
				console.log(p);
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error);
			}
		});
	}

	@SubscribeMessage(SOCKET_EVENTS.ENTER_DM)
	async handleEnterDM(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(async () => {
			this.handOverSocketServer(this.server);
			console.log("Received event: " + SOCKET_EVENTS.ENTER_DM);
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
				client.emit(SOCKET_EVENTS.GET_DIRECT_MESSAGE_HISTORY, messages);
				console.log(
					"Response emitted: " + SOCKET_EVENTS.GET_DIRECT_MESSAGE_HISTORY,
				);
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error);
			}
		});
	}

	@SubscribeMessage(SOCKET_EVENTS.EXIT_DM)
	async handleExitDM(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(async () => {
			this.handOverSocketServer(this.server);
			console.log("Received event: " + SOCKET_EVENTS.EXIT_DM);
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
				const offlineAnnouncement = {
					userID: user.userID,
				};
				this.server
					.to(chatID)
					.emit(SOCKET_EVENTS.USER_OFFLINE, offlineAnnouncement);
				console.log("Response emitted: " + SOCKET_EVENTS.USER_OFFLINE);
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error);
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
		this.eventQueueService.addToQueue(async () => {
			this.handOverSocketServer(this.server);
			console.log("Received event: " + SOCKET_EVENTS.INIT_PLAY);
			try {
				console.log(p);
				const roomID: string | null = this.roomUsers.getRoomId(client.id);
				if (roomID === null) {
					throw new Error("User is not in a room");
				}

				//{check user permissions}
				if (await this.roomUsers.isPaused(roomID)) {
					const startTime: Date = await this.roomUsers.resumeSong(roomID);
					const songID: string | null =
						await this.roomUsers.getCurrentSong(roomID);
					if (songID === null) {
						throw new Error("No song is queued somehow?");
					}

					const response: PlaybackEventDto = {
						date_created: new Date(),
						userID: null,
						roomID: roomID,
						songID: songID,
						UTC_time: startTime.getTime(),
					};
					this.server.to(roomID).emit(SOCKET_EVENTS.PLAY_MEDIA, response);
				} else if (!(await this.roomUsers.isPlaying(roomID))) {
					const songID: string | null =
						await this.roomUsers.getQueueHead(roomID);
					if (songID === null) {
						throw new Error("No song is queued");
					}
					const startTime: Date = await this.roomUsers.playSongNow(
						roomID,
						songID,
					);

					const response: PlaybackEventDto = {
						date_created: new Date(),
						userID: null,
						roomID: roomID,
						songID: songID,
						UTC_time: startTime.getTime(),
					};
					this.server.to(roomID).emit(SOCKET_EVENTS.PLAY_MEDIA, response);
				}
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error);
			}
		});
	}

	@SubscribeMessage(SOCKET_EVENTS.INIT_PAUSE)
	async handleInitPauseMedia(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		console.log("Received event: " + SOCKET_EVENTS.INIT_PAUSE);
		this.handOverSocketServer(this.server);
		try {
			//this.server.emit();
			console.log(p);

			const roomID: string | null = this.roomUsers.getRoomId(client.id);
			if (roomID === null) {
				throw new Error("User is not in a room");
			}

			//{check user permissions}

			if (await this.roomUsers.isPlaying(roomID)) {
				await this.roomUsers.pauseSong(roomID);
				const response: PlaybackEventDto = {
					date_created: new Date(),
					userID: null,
					roomID: roomID,
					songID: null,
					UTC_time: null,
				};
				this.server.to(roomID).emit(SOCKET_EVENTS.PAUSE_MEDIA, response);
			}
		} catch (error) {
			console.error(error);
			this.handleThrownError(client, error);
		}
	}

	@SubscribeMessage(SOCKET_EVENTS.INIT_STOP)
	async handleInitStopMedia(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(async () => {
			this.handOverSocketServer(this.server);
			console.log("Received event: " + SOCKET_EVENTS.INIT_STOP);
			try {
				//this.server.emit();
				console.log(p);

				const roomID: string | null = this.roomUsers.getRoomId(client.id);
				if (roomID === null) {
					throw new Error("User is not in a room");
				}

				//{check user permissions}

				if (await this.roomUsers.isPlaying(roomID)) {
					await this.roomUsers.stopSong(roomID);
					const response: PlaybackEventDto = {
						date_created: new Date(),
						userID: null,
						roomID: roomID,
						songID: null,
						UTC_time: null,
					};
					this.server.to(roomID).emit(SOCKET_EVENTS.STOP_MEDIA, response);
				}
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error);
			}
		});
	}

	@SubscribeMessage(SOCKET_EVENTS.SEEK_MEDIA)
	async handleSeekMedia(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(async () => {
			this.handOverSocketServer(this.server);
			console.log("Received event: " + SOCKET_EVENTS.SEEK_MEDIA);
			try {
				//this.server.emit();
				console.log(p);
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error);
			}
		});
	}

	@SubscribeMessage(SOCKET_EVENTS.CURRENT_MEDIA)
	async handleCurrentMedia(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(async () => {
			this.handOverSocketServer(this.server);
			console.log("Received event: " + SOCKET_EVENTS.CURRENT_MEDIA);
			try {
				//this.server.emit();
				console.log(p);
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error);
			}
		});
	}

	@SubscribeMessage(SOCKET_EVENTS.QUEUE_STATE)
	async handleQueueState(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(async () => {
			this.handOverSocketServer(this.server);
			console.log("Received event: " + SOCKET_EVENTS.QUEUE_STATE);
			try {
				//this.server.emit();
				console.log(p);
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error);
			}
		});
	}

	@SubscribeMessage(SOCKET_EVENTS.MEDIA_SYNC)
	async handleMediaSync(
		@ConnectedSocket() client: Socket,
		@MessageBody() p: string,
	): Promise<void> {
		this.eventQueueService.addToQueue(async () => {
			this.handOverSocketServer(this.server);
			console.log("Received event: " + SOCKET_EVENTS.MEDIA_SYNC);
			try {
				//this.server.emit();
				console.log(p);
			} catch (error) {
				console.error(error);
				this.handleThrownError(client, error);
			}
		});
	}

	/* **************************************************************************************** */

	async validateInputEvent(payload: string): Promise<ChatEventDto> {
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

	async handleThrownError(client: Socket, error: Error): Promise<void> {
		const errorResponse: ChatEventDto = {
			userID: null,
			date_created: new Date(),
			errorMessage: error.message,
		};
		this.server.emit(SOCKET_EVENTS.ERROR, errorResponse);
		console.log("Error emitted: " + SOCKET_EVENTS.ERROR);
	}

	handOverSocketServer(s: Server): void {
		if (!this.liveService.serverSet()) {
			this.liveService.setServer(s);
		}
	}
}
