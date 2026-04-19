import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Category } from './schemas/category.schema';
import { CategoriesService } from './categories.service';

describe('CategoriesService', () => {
  let service: CategoriesService;
  const mockExec = jest.fn();
  const mockLean = jest.fn(() => ({ exec: mockExec }));
  const mockFind = jest.fn(() => ({ lean: mockLean }));

  beforeEach(async () => {
    mockExec.mockReset();
    mockLean.mockClear();
    mockFind.mockClear();
    mockLean.mockReturnValue({ exec: mockExec });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoriesService,
        {
          provide: getModelToken(Category.name),
          useValue: { find: mockFind },
        },
      ],
    }).compile();

    service = module.get(CategoriesService);
  });

  it('findAll returns documents from find().lean().exec()', async () => {
    const docs = [{ name: 'Vocabulary', available: true }];
    mockExec.mockResolvedValue(docs);

    await expect(service.findAll()).resolves.toEqual(docs);
    expect(mockFind).toHaveBeenCalledWith();
    expect(mockExec).toHaveBeenCalled();
  });
});
