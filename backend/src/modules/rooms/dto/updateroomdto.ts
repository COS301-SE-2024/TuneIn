import { PartialType } from "@nestjs/swagger";
import { CreateRoomDto } from "./createroomdto";

export class UpdateRoomDto extends PartialType(CreateRoomDto) {}
