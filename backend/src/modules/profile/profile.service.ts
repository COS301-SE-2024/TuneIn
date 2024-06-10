import { Injectable } from "@nestjs/common";
import { UserProfileDto } from "./dto/userprofile.dto";
import { PrismaService } from "../../../prisma/prisma.service";
import { Prisma } from "@prisma/client";


@Injectable()
export class ProfileService {
	constructor(private readonly prisma: PrismaService) {}
	
	getProfile(): UserProfileDto {
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
