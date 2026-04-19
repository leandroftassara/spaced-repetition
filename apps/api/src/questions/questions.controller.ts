import { Controller, Get, Query } from '@nestjs/common';
import { parseOptionalCategoryId } from './parse-category-id';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Get()
  findAll(@Query('category_id') categoryId?: string) {
    const id = parseOptionalCategoryId(categoryId);
    return this.questionsService.findAll(id);
  }
}
