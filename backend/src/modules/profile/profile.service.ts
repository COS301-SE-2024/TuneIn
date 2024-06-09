import { Injectable } from "@nestjs/common";
import { UserProfileDto } from "./dto/userprofile.dto";

@Injectable()
export class ProfileService {
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
