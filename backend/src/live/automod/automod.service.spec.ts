import { Test, TestingModule } from '@nestjs/testing';
import { AutoModerationService } from './automod.service';
import { createAutoModerationTestingModule } from 'jest_mocking/module-mocking';

describe('AutoModerationService', () => {
  let service: AutoModerationService;

  beforeEach(async () => {
    const module: TestingModule = await createAutoModerationTestingModule();
    service = module.get<AutoModerationService>(AutoModerationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
