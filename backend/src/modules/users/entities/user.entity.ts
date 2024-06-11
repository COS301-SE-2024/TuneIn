import { Prisma } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
	@ApiProperty()
	userID: string;

	@ApiProperty()
	username: string;

	@ApiProperty()
	bio: string;

	@ApiProperty()
	profile_picture: string;

	@ApiProperty()
	activity: Prisma.JsonValue;

	@ApiProperty()
	preferences: Prisma.JsonValue;
}
