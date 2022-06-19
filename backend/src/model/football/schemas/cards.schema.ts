import {Prop, Schema} from '@nestjs/mongoose';
import mongoose from 'mongoose';
import {Card} from './card.schema';

@Schema()
export class Cards {
	@Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Card'}]})
	one: Card;

	@Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Card'}]})
	two: Card;
}
