import { Test, TestingModule } from '@nestjs/testing';
import { SpotifyAuthService } from './spotify.service';

describe('SpotifyAuthService', () => {
  let service: SpotifyAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SpotifyAuthService],
    }).compile();

    service = module.get<SpotifyAuthService>(SpotifyAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
