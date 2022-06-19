import { Prop, Schema } from "@nestjs/mongoose";

@Schema()
export class Time {
  @Prop({ required: true, default: 0 })
  before: number;

  @Prop({ required: true, default: 0 })
  after: number;
}
