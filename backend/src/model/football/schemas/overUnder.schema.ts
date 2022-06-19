import {Prop, Schema} from '@nestjs/mongoose';
import mongoose from 'mongoose';
import {BehindAgainst} from './behindAgainst.schema';
import {isRequiredString} from '../utils/check';

@Schema()
export class OverUnderRates {
	@Prop({validate: isRequiredString, default: ''})
	marketId: string;

	@Prop({validate: isRequiredString, default: ''})
	status: string;

	@Prop({required: true, default: 0})
	totalMatched: number;

	@Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'BehindAgainst'}]})
	over: BehindAgainst;

	@Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'BehindAgainst'}]})
	under: BehindAgainst;
}
