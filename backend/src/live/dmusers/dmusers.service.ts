import { Injectable } from "@nestjs/common";
import { DbUtilsService } from "../../modules/db-utils/db-utils.service";
import { DtoGenService } from "../../modules/dto-gen/dto-gen.service";
import { UserDto } from "../../modules/users/dto/user.dto";
import { UsersService } from "../../modules/users/users.service";

interface dmUser {
	user: UserDto;
	participant: UserDto | null;
	chatID: string | null;
	socketIDs: string[];
}

@Injectable()
export class DmUsersService {
	constructor(
		private readonly dbUtils: DbUtilsService,
		private readonly dtogen: DtoGenService,
		private readonly usersService: UsersService,
	) {}

	private connectedUsers = new Map<string, dmUser>();

	async addConnectedUser(
		socketID: string,
		userId: string,
		participantId?: string,
	): Promise<void> {
		if (!(await this.dbUtils.userExists(userId))) {
			throw new Error("User with ID " + userId + " does not exist");
		}

		if (this.connectedUsers.has(userId)) {
			// add socket id to user
			const u = this.connectedUsers.get(userId);
			if (!u) {
				throw new Error("Connected user does not exist");
			}
			u.socketIDs.push(socketID);
			if (participantId) {
				await this.setChatInfo(socketID, participantId);
			}
			return;
		}

		const user: UserDto = await this.dtogen.generateUserDto(userId);

		this.connectedUsers.set(userId, {
			user: user,
			participant: null,
			chatID: null,
			socketIDs: [socketID],
		});
		if (participantId) {
			await this.setChatInfo(socketID, participantId);
		}

		console.log("Added connected user: " + user);
		console.log("Connected users: " + this.connectedUsers);
	}

	removeConnectedUser(socketID: string) {
		// this.connectedUsers.delete(socketID);
		for (const [key, value] of this.connectedUsers) {
			while (value.socketIDs.includes(socketID)) {
				value.socketIDs.splice(value.socketIDs.indexOf(socketID), 1);
				if (value.socketIDs.length === 0) {
					this.connectedUsers.delete(key);
				}
			}
		}
	}

	getConnectedUser(socketID: string): dmUser | null {
		// const u = this.connectedUsers.get(socketID);
		// if (!u || u === undefined) {
		// 	throw new Error("Connected user does not exist");
		// }
		// return u;
		for (const [key, value] of this.connectedUsers) {
			if (value.socketIDs.includes(socketID)) {
				return value;
			}
		}
		return null;
	}

	getUserId(socketID: string): string | null {
		// const u = this.connectedUsers.get(socketID);
		// if (!u || u === undefined) {
		// 	throw new Error("Connected user does not exist");
		// }
		// const user = u.user;
		// if (!user || user === undefined) {
		// 	throw new Error("Connected user does not have a user object");
		// }
		// if (!user.userID || user.userID === undefined) {
		// 	throw new Error("Connected user does not have a userID");
		// }
		// return user.userID;
		const u = this.getUser(socketID);
		if (u === null) {
			throw new Error("Connected user does not exist");
		}
		return u.userID;
	}

	getUser(socketID: string): UserDto | null {
		// const u = this.connectedUsers.get(socketID);
		// if (!u || u === undefined) {
		// 	throw new Error("Connected user does not exist");
		// }
		// const user = u.user;
		// if (!user || user === undefined) {
		// 	throw new Error("Connected user does not have a user object");
		// }
		// return user;
		const u = this.getConnectedUser(socketID);
		if (u === null) {
			throw new Error("Connected user does not exist");
		}
		return u.user;
	}

	getSocketId(userId: string): string | null {
		// for (const [socketID, u] of this.connectedUsers) {
		// 	if (u.user.userID === userId) {
		// 		return socketID;
		// 	}
		// }
		// return null;
		for (const [key, value] of this.connectedUsers) {
			if (value.socketIDs.includes(userId)) {
				return key;
			}
		}
		return null;
	}

	getParticipant(socketID: string): UserDto | null {
		// const u = this.connectedUsers.get(socketID);
		// if (!u || u === undefined) {
		// 	throw new Error("Connected user does not exist");
		// }
		// const participant = u.participant;
		// if (!participant || participant === undefined) {
		// 	throw new Error("Connected user does not have a participant object");
		// }
		// return participant;
		const u = this.getConnectedUser(socketID);
		if (u === null) {
			throw new Error("Connected user does not exist");
		}
		const participant = u.participant;
		if (participant === null) {
			throw new Error("Connected user does not have a participant object");
		}
		return participant;
	}

	getChatID(socketID: string): string | null {
		// const u = this.connectedUsers.get(socketID);
		// if (!u || u === undefined) {
		// 	throw new Error("Connected user does not exist");
		// }
		// return u.chatID;
		const u = this.getConnectedUser(socketID);
		if (u === null) {
			throw new Error("Connected user does not exist");
		}
		return u.chatID;
	}

	async setChatInfo(socketID: string, participantId: string) {
		const u = this.getConnectedUser(socketID);
		if (!u || u === undefined) {
			throw new Error("Connected user does not exist");
		}
		/*
		if (!(u.participant === null)) {
			throw new Error("Connected user already has a participant");
		}
		if (!(u.chatID === null)) {
			throw new Error("Connected user already has a chatID");
		}
			*/
		if (!(u.participant === null) || !(u.chatID === null)) {
			//disconnect & reconnect
			this.disconnectChat(socketID);
		}

		const participant: UserDto = await this.dtogen.generateUserDto(
			participantId,
		);

		const chatIDs: string[] = await this.usersService.generateChatHash(
			u.user.userID,
			participantId,
		);

		const values: dmUser[] = Array.from(this.connectedUsers.values());
		if (
			chatIDs.length !== 2 ||
			chatIDs[0] === undefined ||
			chatIDs[1] === undefined ||
			chatIDs[0] === chatIDs[1]
		) {
			throw new Error("Invalid chatIDs generated");
		}

		let chatID: string = chatIDs[0];
		if (values.some((u) => u.chatID === chatIDs[1])) {
			const id = values.find((u) => u.chatID === chatIDs[1]);
			if (!id) {
				throw new Error(
					"Very weird error. The chatID exists but the object does not",
				);
			}
			chatID = chatIDs[1];
		}

		this.connectedUsers.set(u.user.userID, {
			user: u.user,
			participant: participant,
			chatID: chatID,
			socketIDs: u.socketIDs,
		});
	}

	disconnectChat(socketID: string) {
		const u = this.getConnectedUser(socketID);
		if (!u || u === undefined) {
			throw new Error("Connected user does not exist");
		}
		this.connectedUsers.set(u.user.userID, {
			user: u.user,
			participant: null,
			chatID: null,
			socketIDs: u.socketIDs,
		});
		console.log(socketId);
	}
}
