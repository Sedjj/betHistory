import {Prop, Schema} from '@nestjs/mongoose';
import {isRequiredString} from '../utils/check';
import {BehindAgainst} from './behindAgainst.schema';

@Schema()
export class MatchOdds {
	@Prop({required: true, default: '', validate: isRequiredString})
	marketId: string;

	@Prop({required: true, default: '', validate: isRequiredString})
	status: string;

	@Prop({required: true, default: 0})
	totalMatched: number;

	@Prop({required: true})
	p1: BehindAgainst;

	@Prop({required: true})
	x: BehindAgainst;

	@Prop({required: true})
	p2: BehindAgainst;

	@Prop({required: true})
	mod: BehindAgainst;
}
