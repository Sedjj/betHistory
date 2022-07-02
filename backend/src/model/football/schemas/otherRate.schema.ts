import {Prop, Schema} from '@nestjs/mongoose';
import {BehindAgainst} from './behindAgainst.schema';

@Schema()
export class OtherRate {
	@Prop({required: true})
	over: BehindAgainst;

	@Prop({required: true})
	under: BehindAgainst;
}
