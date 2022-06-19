import {Prop, Schema} from '@nestjs/mongoose';
import mongoose from 'mongoose';
import {BehindAgainst} from './behindAgainst.schema';

@Schema()
export class OtherRate {
	@Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'BehindAgainst'}]})
	over: BehindAgainst;

	@Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'BehindAgainst'}]})
	under: BehindAgainst;
}
