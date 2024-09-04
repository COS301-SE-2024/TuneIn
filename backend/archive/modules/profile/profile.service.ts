import { Injectable } from "@nestjs/common";
import { UserProfileDto } from "./dto/userprofile.dto";
import { PrismaService } from "../../../prisma/prisma.service";
// import { DtoGenService } from "../dto-gen/dto-gen.service";
// import { DbUtilsService } from "../db-utils/db-utils.service";
import { UpdateUserProfileDto } from "./dto/updateuserprofile.dto";
import { DbUtilsService } from "src/modules/db-utils/db-utils.service";
import { DtoGenService } from "src/modules/dto-gen/dto-gen.service";

@Injectable()
export class ProfileService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly dtogen: DtoGenService,
		private readonly dbUtilsService: DbUtilsService,
	) {}

	async getProfile(uid: string): Promise<UserProfileDto> {
		const user = await this.dtogen.generateUserDto(uid);
		return new UserProfileDto();
	}

	async updateProfile(
		userId: string,
		updateProfileDto: UpdateUserProfileDto,
	): Promise<UserProfileDto> {
		const user = await this.prisma.users.findUnique({
			where: { user_id: userId },
		});

		if (!user) {
			throw new Error("User not found");
		}

		// const updateData = this.dbUtilsService.buildUpdateData(
		// 	user,
		// 	updateProfileDto,
		// );

		// await this.prisma.users.update({
		// 	where: { user_id: userId },
		// 	data: updateData,
		// });

		const userProfile = await this.dtogen.generateUserDto(userId);
		if (!userProfile) {
			throw new Error("Failed to generate user profile");
		}

		return new UserProfileDto();
	}

	async getProfileByUsername(username: string): Promise<UserProfileDto> {
		const userData = await this.prisma.users.findFirst({
			where: { username: username },
		});

		if (!userData) {
			throw new Error("User not found");
		} else {
			const user = await this.dtogen.generateUserDto(userData.user_id);
			if (user) {
				return new UserProfileDto();
			}
		}

		return new UserProfileDto();
	}

	/*
	follower: the person who does the following
	followee (leader): the person being followed
	*/
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

	/*
	follower: the person who does the following
	followee (leader): the person being followed
	*/
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
			//find the follow relationship and delete it
			const follow = await this.prisma.follows.findFirst({
				where: {
					follower: userId,
					followee: accountUnfollowedId,
				},
			});
			if (!follow) {
				return true;
			}

			await this.prisma.follows.delete({
				where: {
					follows_id: follow.follows_id,
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
