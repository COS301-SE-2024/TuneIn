import {
	Controller,
	Get,
	Post,
	Put,
	Patch,
	Body,
	Param,
	UseGuards,
	Request,
} from "@nestjs/common";
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiOkResponse,
	ApiOperation,
	ApiParam,
	ApiTags,
} from "@nestjs/swagger";
import { UserProfileDto } from "./dto/userprofile.dto";
import { ProfileService } from "./profile.service";
import { UpdateUserProfileDto } from "./dto/updateuserprofile.dto";
import { JwtAuthGuard } from "./../../auth/jwt-auth.guard";
import { AuthService, JWTPayload } from "src/auth/auth.service";

@Controller("profile")
export class ProfileController {
	constructor(
		private readonly profileService: ProfileService,
		private readonly auth: AuthService,
	) {}

	//NOTE TO DEV:
	/*
    add decorators to each of these paths like:
    @Post()
    @ApiOperation({ summary: 'Create user' })
    @ApiBody({ type: CreateUserDto })
    @ApiResponse({ status: 201, description: 'The record has been successfully created.', type: User })
    @ApiResponse({ status: 403, description: 'Forbidden.' })
    createUser(@Body() createUserDto: CreateUserDto) {
      //...
    }

    @Get(':id')
    @ApiOperation({ summary: 'Retrieve user' })
    @ApiParam({ name: 'id', required: true })
    @ApiResponse({ status: 200, description: 'The found record', type: User })
    getUser(@Param('id') id: string) {
      //...
    }

    such that the API documentation is more detailed and informative for the next dev.
  */

	/*
    GET /profile
    gets profile info
    no input
    response: return ProfileDto
    */
	@UseGuards(JwtAuthGuard)
	@ApiTags("profile")
	getProfile(@Request() req: any): UserProfileDto {
		return this.profileService.getProfile();
	}

	/*
    PUT /profile
    edits profile info
    input: ProfileDto
    output: updated ProfileDto
    */
	@UseGuards(JwtAuthGuard)
	@Put()
	@ApiTags("profile")
	async updateProfile(
		@Request() req: any,
		@Body() updateProfileDto: UpdateUserProfileDto,
	): Promise<UserProfileDto> {
		return await this.profileService.updateProfile();
	}

	/*
    PATCH /profile
    edits profile info
    input: ProfileDto
    output: updated ProfileDto
    */
	@UseGuards(JwtAuthGuard)
	@Patch()
	@ApiTags("profile")
	async patchProfile(
		@Request() req: any,
		@Body() updateProfileDto: UpdateUserProfileDto,
	): Promise<UserProfileDto> {
		return await this.profileService.patchProfile();
	}

	/*
    GET /profile/{username}
    gets profile info for given username
    no input
    response: ProfileDto
    */
	@UseGuards(JwtAuthGuard)
	@Get(":username")
	@ApiTags("profile")
	async getProfileByUsername(
		@Request() req: any,
		@Param("username") username: string,
	): Promise<UserProfileDto> {
		return await this.profileService.getProfileByUsername();
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Post(":username/follow")
	@ApiTags("profile")
	@ApiOperation({ summary: "Follow the given user" })
	@ApiParam({ name: "username" })
	@ApiOkResponse({
		description: "Successfully followed the user.",
		type: Boolean,
	})
	@ApiBadRequestResponse({
		description: "Error following the user.",
		type: Boolean,
	})
	async followUser(
		@Request() req: any,
		@Param("username") username: string,
	): Promise<boolean> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.profileService.followUser(userInfo.id, username);
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Post(":username/unfollow")
	@ApiTags("profile")
	@ApiOperation({ summary: "Unfollow the given user" })
	@ApiParam({ name: "username" })
	@ApiOkResponse({
		description: "Successfully unfollowed the user.",
		type: Boolean,
	})
	@ApiBadRequestResponse({
		description: "Error unfollowing the user.",
		type: Boolean,
	})
	async unfollowUser(
		@Request() req: any,
		@Param("username") username: string,
	): Promise<boolean> {
		const userInfo: JWTPayload = this.auth.getUserInfo(req);
		return await this.profileService.unfollowUser(userInfo.id, username);
	}
}
