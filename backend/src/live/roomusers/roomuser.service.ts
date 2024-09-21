import { Injectable } from "@nestjs/common";
import { DbUtilsService } from "../../modules/db-utils/db-utils.service";
import { DtoGenService } from "../../modules/dto-gen/dto-gen.service";
import { UserDto } from "../../modules/users/dto/user.dto";
import { PrismaService } from "../../../prisma/prisma.service";
import * as PrismaTypes from "@prisma/client";

interface liveChatUser {
	user: UserDto;
	roomID: string | undefined;
	socketIDs: string[];
}

@Injectable()
export class RoomUsersService {
	constructor(
		private readonly dbUtils: DbUtilsService,
		private readonly dtogen: DtoGenService,
		private readonly prisma: PrismaService,
	) {}

	private connectedUsers = new Map<string, liveChatUser>();

	async addConnectedUser(
		socketID: string,
		userId: string,
		roomID?: string,
	): Promise<void> {
		if (this.connectedUsers.has(userId)) {
			if (!(await this.dbUtils.userExists(userId))) {
				throw new Error("User with ID " + userId + " does not exist");
			}
			const u = this.connectedUsers.get(userId);
			if (u) {
				u.socketIDs.push(socketID);
				if (roomID && roomID !== undefined) {
					if (!(await this.dbUtils.roomExists(roomID))) {
						throw new Error("Room with ID " + roomID + " does not exist");
					}
					u.roomID = roomID;
				}
			}
		} else {
			const user: UserDto = await this.dtogen.generateUserDto(userId);

			if (roomID && roomID !== undefined) {
				if (!(await this.dbUtils.roomExists(roomID))) {
					throw new Error("Room with ID " + roomID + " does not exist");
				}
				this.connectedUsers.set(userId, {
					user,
					roomID,
					socketIDs: [socketID],
				});
			} else {
				this.connectedUsers.set(userId, {
					user,
					roomID: undefined,
					socketIDs: [socketID],
				});
			}
			console.log("Added connected user: " + user);
			console.log("Connected users: " + this.connectedUsers);
		}
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

	getConnectedUser(socketID: string): liveChatUser | null {
		// const u = this.connectedUsers.get(socketID);
		// if (!u || u === undefined) {
		// 	return null;
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
		// 	return null;
		// }
		// const user = u.user;
		// if (!user || user === undefined) {
		// 	throw new Error("Connected user does not have a user object");
		// }
		// if (!user.userID || user.userID === undefined) {
		// 	throw new Error("Connected user does not have a userID");
		// }
		// return user.userID;
		for (const [key, value] of this.connectedUsers) {
			if (value.socketIDs.includes(socketID)) {
				return key;
			}
		}
		return null;
	}

	async setRoomId(socketID: string, roomID: string) {
		// const u = this.connectedUsers.get(socketID);
		// if (!u || u === undefined) {
		// 	throw new Error("Connected user does not exist");
		// }
		// if (!(await this.dbUtils.roomExists(roomID))) {
		// 	throw new Error("Room with ID " + roomID + " does not exist");
		// }
		// u.roomID = roomID;
		for (const [key, value] of this.connectedUsers) {
			if (value.socketIDs.includes(socketID)) {
				this.connectedUsers.set(key, { ...value, roomID });
			}
		}
	}

	async leaveRoom(socketID: string) {
		// const u = this.connectedUsers.get(socketID);
		// if (!u || u === undefined) {
		// 	throw new Error("Connected user does not exist");
		// }
		// if (!u.roomID || u.roomID === undefined) {
		// 	//throw new Error("Connected user does not have a roomID");
		// }
		// u.roomID = undefined;
		for (const [key, value] of this.connectedUsers) {
			if (value.socketIDs.includes(socketID)) {
				this.connectedUsers.set(key, { ...value, roomID: undefined });
			}
		}
	}

	getRoomId(socketID: string): string | null {
		// const u = this.connectedUsers.get(socketID);
		// if (!u || u === undefined) {
		// 	return null;
		// }
		// if (!u.roomID || u.roomID === undefined) {
		// 	throw new Error("Connected user does not have a roomID");
		// }
		// return u.roomID;
		for (const [key, value] of this.connectedUsers) {
			if (value.socketIDs.includes(socketID)) {
				if (value.roomID) {
					return value.roomID;
				}
			}
		}
		return null;
	}

	getRoomUsers(roomID: string): UserDto[] {
		const users: UserDto[] = [];
		this.connectedUsers.forEach((value) => {
			if (value.roomID === roomID) {
				users.push(value.user);
			}
		});
		return users;
	}
}
