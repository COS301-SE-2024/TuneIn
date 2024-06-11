import { Injectable } from "@nestjs/common";
import { UserProfileDto } from "./dto/userprofile.dto";
import { PrismaService } from "../../../prisma/prisma.service";
import { Prisma } from "@prisma/client";
import { DtoGenService } from "../dto-gen/dto-gen.service";
import { DbUtilsService } from "../db-utils/db-utils.service";
import { UpdateUserProfileDto } from "./dto/updateuserprofile.dto";

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly dtogen: DtoGenService,
    private readonly dbUtilsService: DbUtilsService,
  ) {}

  async getProfile(uid: string): Promise<UserProfileDto> {
    const user_id = uid;
    const user = await this.dtogen.generateUserProfileDto(uid);
    if (user) {
      return user;
    }

    return new UserProfileDto();
  }

  async updateProfile(
    userId: string,
    updateProfileDto: UpdateUserProfileDto,
  ): Promise<UserProfileDto> {
    const user = await this.prisma.users.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const updateData = this.dbUtilsService.buildUpdateData(
      user,
      updateProfileDto,
    );

    await this.prisma.users.update({
      where: { user_id: userId },
      data: updateData,
    });

    const userProfile = await this.dtogen.generateUserProfileDto(userId);
    if (!userProfile) {
      throw new Error("Failed to generate user profile");
    }

    return userProfile;
  }

  async getProfileByUsername(username: string): Promise<UserProfileDto> {
    const userData = await this.prisma.users.findFirst({
      where: { username: username },
    });

    if (!userData) {
      throw new Error("User not found");
    } else {
      const user = await this.dtogen.generateUserProfileDto(userData.user_id);
      if (user) {
        return user;
      }
    }

    return new UserProfileDto();
  }

  followUser(): boolean {
    return true;
  }

  unfollowUser(): boolean {
    return true;
  }
}
