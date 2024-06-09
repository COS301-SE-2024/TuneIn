import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty()
  @IsString()
  user_id: string;

  @ApiProperty()
  @IsString()
  username: string;

  @ApiProperty()
  @IsString()
  bio: string;

  @ApiProperty()
  @IsString()
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
