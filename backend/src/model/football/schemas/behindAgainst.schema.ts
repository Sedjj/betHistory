import { Prop, Schema } from "@nestjs/mongoose";

@Schema()
export class BehindAgainst {
  @Prop({ required: true, default: 0 })
  selectionId: number;

  @Prop({ required: true, default: 0 })
  handicap: number;

  @Prop({ required: true, default: 0 })
  behind: number;

  @Prop({ required: true, default: 0 })
  against: number;
}