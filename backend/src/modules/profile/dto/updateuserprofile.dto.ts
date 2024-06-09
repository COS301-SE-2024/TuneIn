import { PartialType } from "@nestjs/swagger";
import { UserProfileDto } from "./userprofile.dto";

export class UpdateUserProfileDto extends PartialType(UserProfileDto) {}
