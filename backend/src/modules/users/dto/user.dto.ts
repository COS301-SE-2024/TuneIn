import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class UserDto {
	//TBA
	@ApiProperty()
	@IsString()
	username: string;

	@ApiProperty()
	@IsString()
	email: string;
}
