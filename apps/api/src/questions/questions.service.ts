import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Question } from './schemas/question.schema';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectModel(Question.name) private questionModel: Model<Question>,
  ) {}

  findAll(categoryId?: string) {
    const filter = categoryId ? { category_id: categoryId } : {};
    return this.questionModel.find(filter).lean().exec();
  }
}
