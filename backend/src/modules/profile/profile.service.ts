import { Injectable } from "@nestjs/common";
import { UserProfileDto } from "./dto/userprofile.dto";
import { PrismaService } from "../../../prisma/prisma.service";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { DbUtilsService } from "../db-utils/db-utils.service";
import * as Prisma from "@prisma/client";

@Injectable()
export class ProfileService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly dtogen: DtoGenService,
		private readonly dbUtilsService: DbUtilsService,
	) {}

	getProfile(): UserProfileDto {
		// an an example to generate a UserProfileDto
		/*
		const user_id = "311ce2e8-8041-70bd-0ab5-be97283ee182"
		const user = await this.dtogen.generateUserProfileDto(user_id);
		if (user) {
			return user;
		}
		*/
		return new UserProfileDto();
	}

	updateProfile(): UserProfileDto {
		return new UserProfileDto();
	}

	patchProfile(): UserProfileDto {
		return new UserProfileDto();
	}

	getProfileByUsername(): UserProfileDto {
		return new UserProfileDto();
	}

	async followUser(
		userId: string,
		accountFollowedId: string,
	): Promise<boolean> {
		if (userId === accountFollowedId) {
			throw new Error("You cannot follow yourself");
		}

		if (!(await this.dbUtilsService.userExists(accountFollowedId))) {
			throw new Error("User (" + accountFollowedId + ") does not exist");
		}

		if (!(await this.dbUtilsService.userExists(userId))) {
			throw new Error("User (" + userId + ") does not exist");
		}

		if (await this.dbUtilsService.isFollowing(userId, accountFollowedId)) {
			return true;
		}

		try {
			await this.prisma.follows.create({
				data: {
					follower: userId,
					followee: accountFollowedId,
				},
			});
			return true;
		} catch (e) {
			throw new Error("Failed to follow user (" + accountFollowedId + ")");
		}
	}

	async unfollowUser(
		userId: string,
		accountUnfollowedId: string,
	): Promise<boolean> {
		if (userId === accountUnfollowedId) {
			throw new Error("You cannot unfollow yourself");
		}

		if (!(await this.dbUtilsService.userExists(accountUnfollowedId))) {
			throw new Error("User (" + accountUnfollowedId + ") does not exist");
		}

		if (!(await this.dbUtilsService.userExists(userId))) {
			throw new Error("User (" + userId + ") does not exist");
		}

		if (!(await this.dbUtilsService.isFollowing(userId, accountUnfollowedId))) {
			return true;
		}

		try {
			await this.prisma.follows.delete({
				where: {
					follower: userId,
					followee: accountUnfollowedId,
				},
			});
			return true;
		} catch (e) {
			throw new Error("Failed to unfollow user (" + accountUnfollowedId + ")");
		}
	}
}
