import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { QuestionsController } from '../src/questions/questions.controller';
import { QuestionsService } from '../src/questions/questions.service';

describe('QuestionsController (e2e)', () => {
  let app: INestApplication<App>;
  const findAll = jest.fn<Promise<unknown[]>, [string | undefined]>();
  const createMany = jest.fn();

  beforeEach(async () => {
    findAll.mockReset();
    createMany.mockReset();
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
          useValue: { findAll, createMany },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
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

  const validItem = {
    category_id: '507f1f77bcf86cd799439011',
    question: 'Q?',
    answers: ['a', 'b', 'c', 'd'],
    correctAnswerIndex: 0,
  };

  it('/questions (POST) returns 201 and body from service', async () => {
    const payload = { insertedCount: 1, ids: ['507f1f77bcf86cd799439012'] };
    createMany.mockResolvedValue(payload);

    await request(app.getHttpServer())
      .post('/questions')
      .send({ questions: [validItem] })
      .expect(201)
      .expect(payload);

    expect(createMany).toHaveBeenCalledWith([validItem]);
  });

  it('/questions (POST) returns 400 on validation error', () => {
    return request(app.getHttpServer())
      .post('/questions')
      .send({ questions: [] })
      .expect(400);
  });

  it('/questions (POST) returns 400 when service rejects categories', async () => {
    createMany.mockRejectedValue(
      new BadRequestException('Unknown category_id(s): x'),
    );

    await request(app.getHttpServer())
      .post('/questions')
      .send({ questions: [validItem] })
      .expect(400);
  });
});
