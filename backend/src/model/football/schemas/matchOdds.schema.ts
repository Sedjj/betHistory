import { Prop, Schema } from "@nestjs/mongoose";
import { isRequiredString } from "../utils/check";
import { BehindAgainst } from "./behindAgainst.schema";
import mongoose from "mongoose";

@Schema()
export class MatchOdds {
	@Prop({ required: true, default: "", validate: isRequiredString })
	marketId: string;

	@Prop({ required: true, default: "", validate: isRequiredString })
	status: string;

	@Prop({ required: true, default: 0 })
	totalMatched: number;

	@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "BehindAgainst" }] })
	p1: BehindAgainst;

	@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "BehindAgainst" }] })
	x: BehindAgainst;

	@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "BehindAgainst" }] })
	p2: BehindAgainst;

	@Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "BehindAgainst" }] })
	mod: BehindAgainst;
}
