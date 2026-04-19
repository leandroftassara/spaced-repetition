import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { App } from 'supertest/types';
import { CategoriesController } from '../src/categories/categories.controller';
import { CategoriesService } from '../src/categories/categories.service';

describe('CategoriesController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const sample = [{ name: 'Vocabulary', available: true }];

    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [CategoriesController],
      providers: [
        {
          provide: CategoriesService,
          useValue: {
            findAll: jest.fn().mockResolvedValue(sample),
          },
        },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('/categories (GET)', () => {
    return request(app.getHttpServer())
      .get('/categories')
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body).toHaveLength(1);
        expect(res.body[0].name).toBe('Vocabulary');
      });
  });
});
