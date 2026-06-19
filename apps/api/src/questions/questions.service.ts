import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CategoriesService } from '../categories/categories.service';
import { CreateQuestionItemDto } from './dto/create-questions.dto';
import { Question } from './schemas/question.schema';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
    private readonly categoriesService: CategoriesService,
  ) {}

  findAll(categoryId?: string) {
    const SAMPLE_SIZE = 500;

    if (!categoryId) {
      return this.questionModel
        .aggregate([{ $sample: { size: SAMPLE_SIZE } }])
        .exec();
    }

    const oid = new Types.ObjectId(categoryId);
    // Match ObjectId-stored refs (normal) and legacy string-stored category_id.
    return this.questionModel
      .aggregate([
        {
          $match: {
            $or: [{ category_id: oid }, { category_id: categoryId }],
          },
        },
        { $sample: { size: SAMPLE_SIZE } },
      ])
      .exec();
  }

  async createMany(items: CreateQuestionItemDto[]) {
    const uniqueIds = [...new Set(items.map((i) => i.category_id))];
    await this.categoriesService.ensureCategoryIdsExist(uniqueIds);
    const docs = items.map((i) => ({
      category_id: new Types.ObjectId(i.category_id),
      question: i.question,
      answers: i.answers,
      correctAnswerIndex: i.correctAnswerIndex,
    }));
    const inserted = await this.questionModel.insertMany(docs);
    return {
      insertedCount: inserted.length,
      ids: inserted.map((d) => String(d._id)),
    };
  }
}
