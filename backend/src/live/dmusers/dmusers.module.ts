import { Module } from '@nestjs/common';
import { DmUsersService } from './dmusers.service';

@Module({
  providers: [DmUsersService]
})
export class DmUsersModule {}
