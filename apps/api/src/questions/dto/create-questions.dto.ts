import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { OBJECT_ID_HEX_PATTERN } from '../parse-category-id';

export class VocabAnswerItemDto {
  @IsString()
  @MinLength(1)
  value: string;

  @IsOptional()
  @IsString()
  explanation?: string;
}

export class CreateQuestionItemDto {
  @Matches(OBJECT_ID_HEX_PATTERN, {
    message: 'category_id must be a 24-character hex ObjectId string',
  })
  category_id: string;

  @IsString()
  @MinLength(1)
  @MaxLength(10_000)
  question: string;

  // Either string[] (multiple-choice) or VocabAnswerItemDto[] (vocabulary).
  // Element-level validation is not enforced here; callers must supply a
  // consistent format matched to the question's category.
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  answers: string[] | VocabAnswerItemDto[];

  // Required for multiple-choice questions; omit for vocabulary questions.
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(3)
  correctAnswerIndex?: number;

  // Vocabulary only: an example sentence shown below the prompt.
  @IsOptional()
  @IsString()
  @MaxLength(10_000)
  example?: string;
}

export class CreateQuestionsBodyDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(100)
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionItemDto)
  questions: CreateQuestionItemDto[];
}
