import { Prop, Schema } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { isRequiredString } from "../utils/check";
import { BehindAgainst } from "./behindAgainst.schema";

@Schema()
export class BothTeamsToScore {
  @Prop({ required: true, default: "", validate: isRequiredString })
  marketId: string;

  @Prop({ required: true, default: "", validate: isRequiredString })
  status: string;

  @Prop({ required: true, default: 0 })
  totalMatched: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "BehindAgainst" }] })
  yes: BehindAgainst;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "BehindAgainst" }] })
  no: BehindAgainst;
}
