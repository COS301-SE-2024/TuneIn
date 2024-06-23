import { PartialType } from "@nestjs/swagger";
import { RoomDto } from "./room.dto";
import { CreateRoomDto } from "./createroomdto";

export class UpdateRoomDto extends PartialType(CreateRoomDto) {}
