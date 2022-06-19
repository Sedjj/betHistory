import {Prop, Schema} from '@nestjs/mongoose';

@Schema()
export class Card {
	@Prop({default: 0})
	red: number;

	@Prop({default: 0})
	yellow: number;

	@Prop({default: 0})
	corners: number;

	@Prop({default: 0})
	attacks: number;

	@Prop({default: 0})
	danAttacks: number;

	@Prop({default: 0})
	shotsOn: number;

	@Prop({default: 0})
	shotsOff: number;
}
