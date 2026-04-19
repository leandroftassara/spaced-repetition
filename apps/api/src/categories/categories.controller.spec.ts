import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';

describe('CategoriesController', () => {
  let controller: CategoriesController;
  const findAll = jest.fn();

  beforeEach(async () => {
    findAll.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: { findAll },
        },
      ],
    }).compile();

    controller = module.get(CategoriesController);
  });

  it('findAll delegates to CategoriesService.findAll', async () => {
    const data = [{ name: 'Vocabulary', available: true }];
    findAll.mockResolvedValue(data);

    await expect(controller.findAll()).resolves.toEqual(data);
    expect(findAll).toHaveBeenCalledTimes(1);
  });
});
