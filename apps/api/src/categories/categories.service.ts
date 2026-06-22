import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Question } from '../questions/schemas/question.schema';
import { Category } from './schemas/category.schema';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name) private categoryModel: Model<Category>,
    @InjectModel(Question.name) private questionModel: Model<Question>,
  ) {}

  async findAll() {
    const cats = await this.categoryModel.find().lean().exec();
    if (cats.length === 0) return [];
    const populated = await this.questionModel
      .distinct('category_id', { category_id: { $in: cats.map((c) => c._id) } })
      .exec();
    const populatedSet = new Set(populated.map(String));
    return cats.filter((c) => populatedSet.has(String(c._id)));
  }

  /** Ensures every distinct id exists in `categories`. Throws 400 listing unknown ids. */
  async ensureCategoryIdsExist(ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    const objectIds = ids.map((id) => new Types.ObjectId(id));
    const found = await this.categoryModel
      .find({ _id: { $in: objectIds } })
      .select('_id')
      .lean()
      .exec();
    const foundSet = new Set(found.map((d) => String(d._id)));
    const missing = ids.filter((id) => !foundSet.has(id));
    if (missing.length > 0) {
      throw new BadRequestException(
        `Unknown category_id(s): ${missing.join(', ')}`,
      );
    }
  }
}
