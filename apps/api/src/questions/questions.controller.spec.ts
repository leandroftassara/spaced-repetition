import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { QuestionsController } from './questions.controller';
import { QuestionsService } from './questions.service';

describe('QuestionsController', () => {
  let controller: QuestionsController;
  const findAll = jest.fn();

  beforeEach(async () => {
    findAll.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuestionsController],
      providers: [
        {
          provide: QuestionsService,
          useValue: { findAll },
        },
      ],
    }).compile();

    controller = module.get(QuestionsController);
  });

  it('findAll with no category_id calls service without id', async () => {
    const data = [
      {
        question: 'Test?',
        correctAnswerIndex: 0,
        answers: ['a', 'b', 'c', 'd'],
      },
    ];
    findAll.mockResolvedValue(data);

    await expect(controller.findAll(undefined)).resolves.toEqual(data);
    expect(findAll).toHaveBeenCalledWith(undefined);
  });

  it('findAll with valid category_id passes id to service', async () => {
    const oid = '507f1f77bcf86cd799439011';
    findAll.mockResolvedValue([]);

    await expect(controller.findAll(oid)).resolves.toEqual([]);
    expect(findAll).toHaveBeenCalledWith(oid);
  });

  it('findAll with invalid category_id throws BadRequestException', () => {
    expect(() => controller.findAll('not-valid')).toThrow(BadRequestException);
    expect(findAll).not.toHaveBeenCalled();
  });
});
