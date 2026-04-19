import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { QuestionsController } from '../src/questions/questions.controller';
import { QuestionsService } from '../src/questions/questions.service';

describe('QuestionsController (e2e)', () => {
  let app: INestApplication<App>;
  const findAll = jest.fn<Promise<unknown[]>, [string | undefined]>();

  beforeEach(async () => {
    findAll.mockReset();
    const sample = [
      {
        question: 'Sample?',
        correctAnswerIndex: 0,
        answers: ['a', 'b', 'c', 'd'],
      },
    ];
    findAll.mockResolvedValue(sample);

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [QuestionsController],
      providers: [
        {
          provide: QuestionsService,
          useValue: { findAll },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/questions (GET)', () => {
    return request(app.getHttpServer())
      .get('/questions')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].question).toBe('Sample?');
      })
      .expect(() => {
        expect(findAll).toHaveBeenCalledWith(undefined);
      });
  });

  it('/questions (GET) with category_id passes to service', async () => {
    findAll.mockResolvedValue([]);
    const oid = '507f1f77bcf86cd799439011';
    await request(app.getHttpServer())
      .get(`/questions?category_id=${oid}`)
      .expect(200)
      .expect([]);
    expect(findAll).toHaveBeenCalledWith(oid);
  });

  it('/questions (GET) with invalid category_id returns 400', () => {
    return request(app.getHttpServer())
      .get('/questions?category_id=bad')
      .expect(400);
  });
});
