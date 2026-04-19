import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { OBJECT_ID_HEX_PATTERN } from '../parse-category-id';

export class CreateQuestionItemDto {
  @Matches(OBJECT_ID_HEX_PATTERN, {
    message: 'category_id must be a 24-character hex ObjectId string',
  })
  category_id: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10_000)
  question: string;

  @IsArray()
  @ArrayMinSize(4)
  @ArrayMaxSize(4)
  @IsString({ each: true })
  answers: string[];

  @IsInt()
  @Min(0)
  @Max(3)
  correctAnswerIndex: number;
}

export class CreateQuestionsBodyDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionItemDto)
  questions: CreateQuestionItemDto[];
}
