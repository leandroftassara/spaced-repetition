import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Question } from './schemas/question.schema';
import { QuestionsService } from './questions.service';

describe('QuestionsService', () => {
  let service: QuestionsService;
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
        QuestionsService,
        {
          provide: getModelToken(Question.name),
          useValue: { find: mockFind },
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

  it('findAll with category_id filters by category_id', async () => {
    const oid = '507f1f77bcf86cd799439011';
    mockExec.mockResolvedValue([]);

    await expect(service.findAll(oid)).resolves.toEqual([]);
    expect(mockFind).toHaveBeenCalledWith({ category_id: oid });
  });
});
