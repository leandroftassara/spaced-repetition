import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type QuestionDocument = HydratedDocument<Question>;

@Schema({ collection: 'questions', versionKey: false })
export class Question {
  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  category_id: Types.ObjectId;

  @Prop({ required: true })
  question: string;

  @Prop({ type: [String], required: true })
  answers: string[];

  @Prop({ required: true, min: 0, max: 3 })
  correctAnswerIndex: number;
}

export const QuestionSchema = SchemaFactory.createForClass(Question);
