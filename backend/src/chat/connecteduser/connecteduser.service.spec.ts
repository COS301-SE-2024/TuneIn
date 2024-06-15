import { Test, TestingModule } from '@nestjs/testing';
import { ConnecteduserService } from './connecteduser.service';

describe('ConnecteduserService', () => {
  let service: ConnecteduserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConnecteduserService],
    }).compile();

    service = module.get<ConnecteduserService>(ConnecteduserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
