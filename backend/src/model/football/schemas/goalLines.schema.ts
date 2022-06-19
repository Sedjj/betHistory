import { Prop, Schema } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { isRequiredString } from "../utils/check";
import { OtherRate } from "./otherRate.schema";

@Schema()
export class GoalLines {
  @Prop({ required: true, default: "", validate: isRequiredString })
  marketId: string;

  @Prop({ required: true, default: "", validate: isRequiredString })
  status: string;

  @Prop({ required: true, default: 0 })
  totalMatched: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "OtherRate" }] })
  list: OtherRate[];
}