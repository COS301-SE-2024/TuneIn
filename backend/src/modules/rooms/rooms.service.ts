import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma, room } from '@prisma/client';
import { RoomDto } from './dto/room.dto';
import { UpdateRoomDto } from './dto/updateroomdto';
import { SongInfoDto } from './dto/songinfo.dto';
import { UserProfileDto } from '../profile/dto/userprofile.dto';

@Injectable()
export class RoomsService {
  constructor(private readonly prisma: PrismaService) {}

  private roomToDto(room: RoomDto): RoomDto {
    return {
      creator: room.creator,
      room_id: room.room_id,
      participant_count: room.participant_count,
      room_name: room.room_name,
      description: room.description,
      is_temporary: room.is_temporary,
      is_private: room.is_private,
      is_scheduled: room.is_scheduled,
      start_date: room.start_date,
      end_date: room.end_date,
      language: room.language,
      has_explicit_content: room.has_explicit_content,
      has_nsfw_content: room.has_nsfw_content,
      room_image: room.room_image,
      current_song: room.current_song,
      tags: room.tags,
    };
  }

  async getNewRooms(): Promise<RoomDto[]> {
    const rooms = await this.prisma.room.findMany({
      where: { is_private: false, is_temporary: false },
      orderBy: { created_at: 'desc' },
    });
    return rooms.map((room) => this.roomToDto(room));
  }

  async getRoomInfo(room_id: string): Promise<RoomDto> {
    const room = await this.prisma.room.findUnique({
      where: { room_id },
    });
    if (!room) {
      throw new NotFoundException(`Room with ID ${room_id} not found`);
    }
    return this.roomToDto(room);
  }

  async updateRoomInfo(room_id: string, updateRoomDto: UpdateRoomDto): Promise<RoomDto> {
    await this.prisma.room.update({
      where: { room_id },
      data: updateRoomDto,
    });
    const updatedRoom = await this.prisma.room.findUnique({
      where: { room_id },
    });
    if (!updatedRoom) {
      throw new NotFoundException(`Room with ID ${room_id} not found`);
    }
    return this.roomToDto(updatedRoom);
  }

  async updateRoom(room_id: string, updateRoomDto: UpdateRoomDto): Promise<RoomDto> {
    const room = await this.prisma.room.findUnique({
      where: { room_id },
    });
    if (!room) {
      throw new NotFoundException(`Room with ID ${room_id} not found`);
    }
    const updatedRoom = await this.prisma.room.update({
      where: { room_id },
      data: updateRoomDto,
    });
    return this.roomToDto(updatedRoom);
  }

  async deleteRoom(room_id: string): Promise<void> {
    const result = await this.prisma.room.delete({
      where: { room_id },
    });
    if (!result) {
      throw new NotFoundException(`Room with ID ${room_id} not found`);
    }
  }

  async joinRoom(room_id: string): Promise<void> {
    const room = await this.prisma.room.findUnique({
      where: { room_id },
    });
    if (!room) {
      throw new NotFoundException(`Room with ID ${room_id} not found`);
    }
    await this.prisma.room.update({
      where: { room_id },
      data: {
        participant_count: {
          increment: 1,
        },
      },
    });
  }

  async leaveRoom(room_id: string): Promise<void> {
    const room = await this.prisma.room.findUnique({
      where: { room_id },
    });
    if (!room) {
      throw new NotFoundException(`Room with ID ${room_id} not found`);
    }
    await this.prisma.room.update({
      where: { room_id },
      data: {
        participant_count: {
          decrement: 1,
        },
      },
    });
  }

  async getRoomUsers(room_id: string): Promise<UserProfileDto[]> {
    const room = await this.prisma.room.findUnique({
      where: { room_id },
      include: { users: true },
    });
    if (!room) {
      throw new NotFoundException(`Room with ID ${room_id} not found`);
    }
    return room.users;
  }

  async getRoomQueue(room_id: string): Promise<SongInfoDto[]> {
    const room = await this.prisma.room.findUnique({
      where: { room_id },
      include: { song_queue: true },
    });
    if (!room) {
      throw new NotFoundException(`Room with ID ${room_id} not found`);
    }
    return room.song_queue;
  }

  async clearRoomQueue(room_id: string): Promise<void> {
    const room = await this.prisma.room.findUnique({
      where: { room_id },
      include: { song_queue: true },
    });
    if (!room) {
      throw new NotFoundException(`Room with ID ${room_id} not found`);
    }
    await this.prisma.room.update({
      where: { room_id },
      data: {
        song_queue: [],
      },
    });
  }

  async addSongToQueue(room_id: string, songInfoDto: SongInfoDto): Promise<SongInfoDto[]> {
    const room = await this.prisma.room.findUnique({
      where: { room_id },
      include: { song_queue: true },
    });
    if (!room) {
      throw new NotFoundException(`Room with ID ${room_id} not found`);
    }
    const updatedRoom = await this.prisma.room.update({
      where: { room_id },
      data: {
        song_queue: {
          push: songInfoDto,
        },
      },
      include: { song_queue: true },
    });
    return updatedRoom.song_queue;
  }

  async getCurrentSong(room_id: string): Promise<SongInfoDto> {
    const room = await this.prisma.room.findUnique({
      where: { room_id },
      include: { current_song: true },
    });
    if (!room) {
      throw new NotFoundException(`Room with ID ${room_id} not found`);
    }
    return room.current_song;
  }
}
