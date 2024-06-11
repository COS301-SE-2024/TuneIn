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
import { ApiTags } from "@nestjs/swagger";
import { UserProfileDto } from "./dto/userprofile.dto";
import { ProfileService } from "./profile.service";
import { UpdateUserProfileDto } from "./dto/updateuserprofile.dto";
import { JwtAuthGuard } from "./../../auth/jwt-auth.guard";

@Controller("profile")
export class ProfileController {
	constructor(private readonly profileService: ProfileService) {}

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
	@Get()
	@ApiTags("profile")
	getProfile(@Request() req: any): Promise<UserProfileDto>  {
		return this.profileService.getProfile(req.user.userId);
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
	async putProfile(@Request() req: any, @Body() updateProfileDto: UpdateUserProfileDto): Promise<UserProfileDto> {
		return await this.profileService.updateProfile(req.user.userId, updateProfileDto);
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
	async patchProfile(@Request() req: any, @Body() updateProfileDto: UpdateUserProfileDto): Promise<UserProfileDto> {
		return await this.profileService.updateProfile(req.user.userId, updateProfileDto);
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
	async getProfileByUsername(@Request() req: any, @Param("username") username: string): Promise<UserProfileDto> {
		return this.profileService.getProfileByUsername(username);
	}

	/*
    POST /profile/{username}/follow
    follows the user with the username given
    no input
    response: code (2xx for success, 4xx for error)
    */
	@UseGuards(JwtAuthGuard)
	@Post(":username/follow")
	@ApiTags("profile")
	followUser(@Request() req: any, @Param("username") username: string): boolean {
		return this.profileService.followUser();
	}

	/*
    POST /profile/{username}/unfollow
    unfollows the user with the username given
    no input
    response: code (2xx for success, 4xx for error)
    */
	@UseGuards(JwtAuthGuard)
	@Post(":username/unfollow")
	@ApiTags("profile")
	unfollowUser(@Request() req: any, @Param("username") username: string): boolean {
		return this.profileService.unfollowUser();
	}
}
