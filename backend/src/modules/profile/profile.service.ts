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

	followUser(): boolean {
		return true;
	}

	unfollowUser(): boolean {
		return true;
	}
}
