import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';

export type QuestionDocument = HydratedDocument<Question>;

@Schema({ collection: 'questions', versionKey: false })
export class Question {
  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category_id: Types.ObjectId;

  @Prop({ required: true })
  question: string;

  // Each element is either a plain string (multiple-choice) or a
  // { value, explanation? } object (vocabulary).
  @Prop({ type: [MongooseSchema.Types.Mixed], required: true })
  answers: (string | { value: string; explanation?: string })[];

  @Prop({ required: false, min: 0, max: 3 })
  correctAnswerIndex?: number;

  // Vocabulary only: an example sentence shown below the prompt.
  @Prop({ required: false })
  example?: string;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
