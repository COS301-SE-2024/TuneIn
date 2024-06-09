import { Controller, Get, Post, Put, Patch } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { UserProfileDto } from "./dto/userprofile.dto";

@Controller("profile")
export class ProfileController {
	/*
    GET /profile
    gets profile info
    no input
    response: return ProfileDto
    */
	@Get()
	@ApiTags("profile")
	getProfile() {
        return this.profileService.getProfile();
	}

	/*
    PUT /profile
    edits profile info
    input: ProfileDto
    output: updated ProfileDto
    */
	@Put()
	@ApiTags("profile")
	updateProfile() {
		return this.profileService.updateProfile();
	}

	/*
    PATCH /profile
    edits profile info
    input: ProfileDto
    output: updated ProfileDto
    */
	@Patch()
	@ApiTags("profile")
	patchProfile() {
		return this.profileService.patchProfile();
	}

	/*
    GET /profile/{username}
    gets profile info for given username
    no input
    response: ProfileDto
    */
	@Get(":username")
	@ApiTags("profile")
	getProfileByUsername() {
		return this.profileService.getProfileByUsername();
	}

	/*
    POST /profile/{username}/follow
    follows the user with the username given
    no input
    response: code (2xx for success, 4xx for error)
    */
	@Post(":username/follow")
	@ApiTags("profile")
	followUser() {
		return this.profileService.followUser();
	}

	/*
    POST /profile/{username}/unfollow
    unfollows the user with the username given
    no input
    response: code (2xx for success, 4xx for error)
    */
	@Post(":username/unfollow")
	@ApiTags("profile")
	unfollowUser() {
		return this.profileService.unfollowUser();
	}
}
