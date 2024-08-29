import { PartialType } from "@nestjs/swagger";
import { UserDto } from "./user.dto";

export class UpdateUserDto extends PartialType(UserDto) {
	[key: string]: any;
}
