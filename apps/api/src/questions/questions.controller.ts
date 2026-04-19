import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { CreateQuestionsBodyDto } from './dto/create-questions.dto';
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

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() body: CreateQuestionsBodyDto) {
    return this.questionsService.createMany(body.questions);
  }
}
