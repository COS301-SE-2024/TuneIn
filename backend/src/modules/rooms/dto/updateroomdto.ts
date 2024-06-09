import { PartialType } from "@nestjs/swagger";
import { RoomDto } from "./room.dto";

export class UpdateRoomDto extends PartialType(RoomDto) {}
