import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

//based on
/*
import { users } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto extends users {
  @ApiProperty()
  user_id: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  bio: string;

  @ApiProperty()
  profile_picture: string;

  @ApiProperty()
  activity: any;

  @ApiProperty()
  preferences: any;

  @ApiProperty()
  bookmark: any[];

  @ApiProperty()
  follows_follows_followeeTousers: any[];

  @ApiProperty()
  follows_follows_followerTousers: any[];

  @ApiProperty()
  friends_friends_friend1Tousers: any[];

  @ApiProperty()
  friends_friends_friend2Tousers: any[];

  @ApiProperty()
  message: any[];

  @ApiProperty()
  participate: any[];

  @ApiProperty()
  private_message: any[];

  @ApiProperty()
  room: any[];
}

*/

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(createUserDto: CreateUserDto) {
    const user: Prisma.usersCreateInput = {
      user_id: createUserDto.user_id,
      username: createUserDto.username,
      bio: createUserDto.bio,
      profile_picture: createUserDto.profile_picture,
      activity: createUserDto.activity,
      preferences: createUserDto.preferences,
    };
    return this.prisma.users.create({ data: user });
  }

  findAll() {
    return this.prisma.users.findMany();
  }

  findOne(user_id: string) {
    return this.prisma.users.findUnique({
      where: { user_id: user_id },
    });
  }

  update(user_id: string, updateUserDto: UpdateUserDto) {
    const user: Prisma.usersUpdateInput = {
      user_id: updateUserDto.user_id,
      username: updateUserDto.username,
      bio: updateUserDto.bio,
      profile_picture: updateUserDto.profile_picture,
      activity: updateUserDto.activity,
      preferences: updateUserDto.preferences,
    };
    return this.prisma.users.update({
      where: { user_id: user_id },
      data: user,
    });
  }

  remove(user_id: string) {
    return this.prisma.users.delete({
      where: { user_id: user_id },
    });
  }
}
