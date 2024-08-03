import { Test, TestingModule } from '@nestjs/testing';
import { DmUsersService } from './dmusers.service';

describe('DmUsersService', () => {
  let service: DmUsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DmUsersService],
    }).compile();

    service = module.get<DmUsersService>(DmUsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
