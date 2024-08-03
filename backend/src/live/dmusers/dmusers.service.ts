import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../../prisma/prisma.service";
import { DbUtilsService } from "../../modules/db-utils/db-utils.service";
import { DtoGenService } from "../../modules/dto-gen/dto-gen.service";
import { UserDto } from "../../modules/users/dto/user.dto";
import { UsersService } from "../../modules/users/users.service";

interface dmUser {
	user: UserDto;
	participant: UserDto | null;
	chatID: string | null;
}

@Injectable()
export class DmUsersService {
	constructor(
		private readonly dbUtils: DbUtilsService,
		private readonly dtogen: DtoGenService,
		private readonly prisma: PrismaService,
		private readonly usersService: UsersService,
	) {}

	private connectedUsers = new Map<string, dmUser>();

	async addConnectedUser(
		socketId: string,
		userId: string,
		participantId?: string,
	): Promise<void> {
		if (this.connectedUsers.has(socketId)) {
			return;
		}
		if (!(await this.dbUtils.userExists(userId))) {
			throw new Error("User with ID " + userId + " does not exist");
		}
		const user: UserDto = await this.dtogen.generateUserDto(userId);

		this.connectedUsers.set(socketId, {
			user: user,
			participant: null,
			chatID: null,
		});
		if (participantId) {
			await this.setChatInfo(socketId, participantId);
		}

		console.log("Added connected user: " + user);
		console.log("Connected users: " + this.connectedUsers);
	}

	removeConnectedUser(socketId: string) {
		this.connectedUsers.delete(socketId);
	}

	getConnectedUser(socketId: string): dmUser | null {
		const u = this.connectedUsers.get(socketId);
		if (!u || u === undefined) {
			throw new Error("Connected user does not exist");
		}
		return u;
	}

	getUserId(socketId: string): string | null {
		const u = this.connectedUsers.get(socketId);
		if (!u || u === undefined) {
			throw new Error("Connected user does not exist");
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

	getUser(socketId: string): UserDto | null {
		const u = this.connectedUsers.get(socketId);
		if (!u || u === undefined) {
			throw new Error("Connected user does not exist");
		}
		const user = u.user;
		if (!user || user === undefined) {
			throw new Error("Connected user does not have a user object");
		}
		return user;
	}

	getParticipant(socketId: string): UserDto | null {
		const u = this.connectedUsers.get(socketId);
		if (!u || u === undefined) {
			throw new Error("Connected user does not exist");
		}
		const participant = u.participant;
		if (!participant || participant === undefined) {
			throw new Error("Connected user does not have a participant object");
		}
		return participant;
	}

	getChatID(socketId: string): string | null {
		const u = this.connectedUsers.get(socketId);
		if (!u || u === undefined) {
			throw new Error("Connected user does not exist");
		}
		return u.chatID;
	}

	async setChatInfo(socketId: string, participantId: string) {
		const u = this.connectedUsers.get(socketId);
		if (!u || u === undefined) {
			throw new Error("Connected user does not exist");
		}
		if (!(u.participant === null)) {
			throw new Error("Connected user already has a participant");
		}
		if (!(u.chatID === null)) {
			throw new Error("Connected user already has a chatID");
		}
		const participant: UserDto =
			await this.dtogen.generateUserDto(participantId);
		const chatIDs: string[] = await this.usersService.generateChatHash(
			u.user.userID,
			participantId,
		);
		const values: dmUser[] = Array.from(this.connectedUsers.values());
		let chatID = chatIDs[0];
		if (values.some((u) => u.chatID === chatIDs[1])) {
			const id = values.find((u) => u.chatID === chatIDs[1]);
			if (!id) {
				throw new Error(
					"Very weird error. The chatID exists but the object does not",
				);
			}
			chatID = chatIDs[1];
		}

		this.connectedUsers.set(socketId, {
			user: u.user,
			participant: participant,
			chatID: chatID,
		});
	}
}
