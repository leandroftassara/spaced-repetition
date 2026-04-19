import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ collection: 'categories' })
export class Category {
  @Prop({ required: true })
  name: string;

  @Prop({ default: true })
  available: boolean;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
