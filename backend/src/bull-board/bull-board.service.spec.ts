import { Test, TestingModule } from '@nestjs/testing';
import { BullBoardService } from './bull-board.service';

describe('BullBoardService', () => {
  let service: BullBoardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BullBoardService],
    }).compile();

    service = module.get<BullBoardService>(BullBoardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
