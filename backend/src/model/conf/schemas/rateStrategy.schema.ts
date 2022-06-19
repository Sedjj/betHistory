import {Prop, Schema} from '@nestjs/mongoose';

@Schema()
export class RateStrategy {
  @Prop({ required: true, default: ''"")
  title: string;

  @Prop({ required: true, default: 0 })
  rate: number;
}
