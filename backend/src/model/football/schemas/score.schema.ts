import { Prop, Schema } from "@nestjs/mongoose";
import { isRequiredString } from "../utils/check";

@Schema()
export class Score {
  @Prop({ required: true, default: 0 })
  sc1: number;

  @Prop({ required: true, default: 0 })
  sc2: number;

  @Prop({ default: "", validate: isRequiredString })
  resulting: string;
}
