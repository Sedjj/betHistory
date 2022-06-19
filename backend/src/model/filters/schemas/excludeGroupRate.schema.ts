import { Prop, Schema } from "@nestjs/mongoose";

@Schema()
export class ExcludeGroupRate {
  @Prop({ required: true, default: "" })
  name: string;

  @Prop({ required: true, default: 0 })
  enable: number;
}
