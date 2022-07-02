import {Prop, Schema} from '@nestjs/mongoose';
import {Card} from './card.schema';

@Schema()
export class Cards {
	@Prop({required: true})
	one: Card;

	@Prop({required: true})
	two: Card;
}
