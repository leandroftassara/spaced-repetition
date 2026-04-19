import { BadRequestException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';
import { CategoriesService } from '../categories/categories.service';
import { Question } from './schemas/question.schema';
import { QuestionsService } from './questions.service';

describe('QuestionsService', () => {
  let service: QuestionsService;
  const mockExec = jest.fn();
  const mockLean = jest.fn(() => ({ exec: mockExec }));
  const mockFind = jest.fn(() => ({ lean: mockLean }));
  const insertMany = jest.fn();
  const ensureCategoryIdsExist = jest.fn();

  beforeEach(async () => {
    mockExec.mockReset();
    mockLean.mockClear();
    mockFind.mockClear();
    mockLean.mockReturnValue({ exec: mockExec });
    insertMany.mockReset();
    ensureCategoryIdsExist.mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuestionsService,
        {
          provide: getModelToken(Question.name),
          useValue: { find: mockFind, insertMany },
        },
        {
          provide: CategoriesService,
          useValue: { ensureCategoryIdsExist },
        },
      ],
    }).compile();

    service = module.get(QuestionsService);
  });

  it('findAll with no category uses empty filter', async () => {
    const docs = [
      {
        question: 'Test?',
        correctAnswerIndex: 0,
        answers: ['a', 'b', 'c', 'd'],
      },
    ];
    mockExec.mockResolvedValue(docs);

    await expect(service.findAll()).resolves.toEqual(docs);
    expect(mockFind).toHaveBeenCalledWith({});
    expect(mockExec).toHaveBeenCalled();
  });

  it('findAll with category_id filters by ObjectId and string for compatibility', async () => {
    const oid = '507f1f77bcf86cd799439011';
    mockExec.mockResolvedValue([]);

    await expect(service.findAll(oid)).resolves.toEqual([]);
    expect(mockFind).toHaveBeenCalledWith({
      $or: [{ category_id: new Types.ObjectId(oid) }, { category_id: oid }],
    });
  });

  describe('createMany', () => {
    const oid = '507f1f77bcf86cd799439011';
    const item = {
      category_id: oid,
      question: 'Q?',
      answers: ['a', 'b', 'c', 'd'],
      correctAnswerIndex: 0,
    };

    it('validates unique category ids then insertMany', async () => {
      ensureCategoryIdsExist.mockResolvedValue(undefined);
      const newId = new Types.ObjectId();
      insertMany.mockResolvedValue([{ _id: newId }]);

      await expect(service.createMany([item])).resolves.toEqual({
        insertedCount: 1,
        ids: [String(newId)],
      });

      expect(ensureCategoryIdsExist).toHaveBeenCalledWith([oid]);
      expect(insertMany).toHaveBeenCalledWith([
        {
          category_id: new Types.ObjectId(oid),
          question: 'Q?',
          answers: ['a', 'b', 'c', 'd'],
          correctAnswerIndex: 0,
        },
      ]);
    });

    it('dedupes category_id for validation', async () => {
      ensureCategoryIdsExist.mockResolvedValue(undefined);
      const id1 = new Types.ObjectId();
      const id2 = new Types.ObjectId();
      insertMany.mockResolvedValue([{ _id: id1 }, { _id: id2 }]);

      await service.createMany([
        item,
        { ...item, question: 'Second' },
      ]);

      expect(ensureCategoryIdsExist).toHaveBeenCalledWith([oid]);
    });

    it('propagates BadRequestException from category validation', async () => {
      ensureCategoryIdsExist.mockRejectedValue(
        new BadRequestException('Unknown category_id(s): x'),
      );

      await expect(service.createMany([item])).rejects.toThrow(
        BadRequestException,
      );
      expect(insertMany).not.toHaveBeenCalled();
    });
  });
});
