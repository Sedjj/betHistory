import {Prop, Schema} from '@nestjs/mongoose';
import {MatchOdds} from './matchOdds.schema';
import {GoalLines} from './goalLines.schema';
import {OverUnderRates} from './overUnder.schema';
import {BothTeamsToScore} from './bothTeamsToScore.schema';

@Schema()
export class Rates {
	@Prop({required: true})
	matchOdds: MatchOdds;

	@Prop({required: true})
	overUnder15: OverUnderRates;

	@Prop({required: true})
	overUnder25: OverUnderRates;

	@Prop({required: true})
	bothTeamsToScore: BothTeamsToScore;

	@Prop({required: true})
	goalLines: GoalLines;
}
