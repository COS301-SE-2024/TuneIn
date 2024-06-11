import { Injectable } from "@nestjs/common";
import { UserProfileDto } from "./dto/userprofile.dto";
import { PrismaService } from "../../../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { DbUtilsService } from "../db-utils/db-utils.service";

@Injectable()
export class ProfileService {
	constructor(
		private readonly prisma: PrismaService,
		private readonly dtogen: DtoGenService,
		private readonly dbUtilsService: DbUtilsService,
	) {}

	async getProfile(uid: string): Promise<UserProfileDto> {
		const user_id = uid;;
		const user = await this.dtogen.generateUserProfileDto(uid);
		if (user) {
			return user;
		}

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

	followUser(): boolean {
		return true;
	}

	unfollowUser(): boolean {
		return true;
	}
}
