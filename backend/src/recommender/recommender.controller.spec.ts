import { Test, TestingModule } from '@nestjs/testing';
import { RecommenderController } from './recommender.controller';

describe('RecommenderController', () => {
  let controller: RecommenderController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecommenderController],
    }).compile();

    controller = module.get<RecommenderController>(RecommenderController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
