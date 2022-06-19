import {Prop, Schema} from '@nestjs/mongoose';
import mongoose from 'mongoose';
import {MatchOdds} from './matchOdds.schema';
import {GoalLines} from './goalLines.schema';
import {OverUnderRates} from './overUnder.schema';
import {BothTeamsToScore} from './bothTeamsToScore.schema';

@Schema()
export class Rates {
	@Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'MatchOdds'}]})
	matchOdds: MatchOdds;

	@Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'OverUnderRates'}]})
	overUnder15: OverUnderRates;

	@Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'OverUnderRates'}]})
	overUnder25: OverUnderRates;

	@Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'BothTeamsToScore'}]})
	bothTeamsToScore: BothTeamsToScore;

	@Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'GoalLines'}]})
	goalLines: GoalLines;
}
