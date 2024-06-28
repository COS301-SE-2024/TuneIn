import { Injectable } from "@nestjs/common";
import { DbUtilsService } from "../../modules/db-utils/db-utils.service";
import { DtoGenService } from "../../modules/dto-gen/dto-gen.service";
import { UserProfileDto } from "../../modules/profile/dto/userprofile.dto";

interface liveChatUser {
	user: UserProfileDto;
	roomID?: string;
}

@Injectable()
export class ConnectedUsersService {
	constructor(
		private readonly dbUtils: DbUtilsService,
		private readonly dtogen: DtoGenService,
	) {}

	private connectedUsers = new Map<string, liveChatUser>();

	async addConnectedUser(
		socketId: string,
		userId: string,
		roomID?: string,
	): Promise<void> {
		if (this.connectedUsers.has(socketId)) {
			return;
		}
		if (!(await this.dbUtils.userExists(userId))) {
			throw new Error("User with ID " + userId + " does not exist");
		}
		const user: UserProfileDto =
			await this.dtogen.generateUserProfileDto(userId);

		if (roomID && roomID !== undefined) {
			if (!(await this.dbUtils.roomExists(roomID))) {
				throw new Error("Room with ID " + roomID + " does not exist");
			}
			this.connectedUsers.set(socketId, { user, roomID });
		} else {
			this.connectedUsers.set(socketId, { user });
		}

		console.log("Added connected user: " + user);
		console.log("Connected users: " + this.connectedUsers);
	}

	removeConnectedUser(socketId: string) {
		this.connectedUsers.delete(socketId);
	}

	getConnectedUser(socketId: string): liveChatUser | null {
		const u = this.connectedUsers.get(socketId);
		if (!u || u === undefined) {
			return null;
		}
		return u;
	}

	getUserId(socketId: string): string | null {
		const u = this.connectedUsers.get(socketId);
		if (!u || u === undefined) {
			return null;
		}
		const user = u.user;
		if (!user || user === undefined) {
			throw new Error("Connected user does not have a user object");
		}
		if (!user.userID || user.userID === undefined) {
			throw new Error("Connected user does not have a userID");
		}
		return user.userID;
	}

	async setRoomId(socketId: string, roomID: string) {
		const u = this.connectedUsers.get(socketId);
		if (!u || u === undefined) {
			throw new Error("Connected user does not exist");
		}
		if (!(await this.dbUtils.roomExists(roomID))) {
			throw new Error("Room with ID " + roomID + " does not exist");
		}
		u.roomID = roomID;
	}

	async leaveRoom(socketId: string) {
		const u = this.connectedUsers.get(socketId);
		if (!u || u === undefined) {
			throw new Error("Connected user does not exist");
		}
		if (!u.roomID || u.roomID === undefined) {
			throw new Error("Connected user does not have a roomID");
		}
		u.roomID = undefined;
	}

	getRoomId(socketId: string): string | null {
		const u = this.connectedUsers.get(socketId);
		if (!u || u === undefined) {
			return null;
		}
		if (!u.roomID || u.roomID === undefined) {
			throw new Error("Connected user does not have a roomID");
		}
		return u.roomID;
	}

	getRoomUsers(roomID: string): UserProfileDto[] {
		const users: UserProfileDto[] = [];
		this.connectedUsers.forEach((value) => {
			if (value.roomID === roomID) {
				users.push(value.user);
			}
		});
		return users;
	}
}
