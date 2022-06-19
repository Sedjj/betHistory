import { Prop, Schema } from "@nestjs/mongoose";
import { isRequiredString } from "../utils/check";

@Schema()
export class Command {
  @Prop({ default: "", validate: isRequiredString })
  one: string;

  @Prop({ default: "", validate: isRequiredString })
  two: string;

  @Prop({ default: "", validate: isRequiredString })
  group: string;

  @Prop({ required: true, default: 0 })
  women: number;

  @Prop({ required: true, default: 0 })
  youth: number;

  @Prop({ required: true, default: 0 })
  limited: number;
}
