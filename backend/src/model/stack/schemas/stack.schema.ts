import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { StackType } from "../type/stack.type";
import { Document } from "mongoose";

export type StackDocument = Stack & Document;

@Schema()
export class Stack {
  @Prop({ required: true, default: StackType.UNUSUAL })
  stackId: StackType;

  /**
   * Стек активных событий для получения результата
   */
  @Prop({ required: true, default: [] })
  activeEventIds: number[];
}

export const StackSchema = SchemaFactory.createForClass(Stack);
