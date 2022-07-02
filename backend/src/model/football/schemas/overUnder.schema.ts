import {Prop, Schema} from '@nestjs/mongoose';
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

	@Prop({required: true})
	over: BehindAgainst;

	@Prop({required: true})
	under: BehindAgainst;
}
