import {Schema} from 'mongoose';
import {matchOdds} from './matchOdds.schema';
import {overUnderRates} from './overUnder.schema';
import {isRequiredString} from '../utils/check';
import {bothTeamsToScore} from './bothTeamsToScore.schema';
import {cards} from './cards.schema';
import {goalLines} from './goalLines.schema';

export let FootballSchema = new Schema({
	marketId: {
		type: String,
		validate: isRequiredString,
		default: '',
	},
	eventId: {
		type: Number,
		required: true,
		default: 0,
	},
	strategy: {
		type: Number,
		required: true,
		default: 0,
	},
	time: {
		type: Number,
		required: true,
		default: 0,
	},
	score: {
		sc1: {
			type: Number,
			required: true,
			default: 0,
		},
		sc2: {
			type: Number,
			required: true,
			default: 0,
		},
		resulting: {
			type: String,
			validate: isRequiredString,
			default: '',
		},
	},
	command: {
		one: {
			type: String,
			validate: isRequiredString,
			default: '',
		},
		two: {
			type: String,
			validate: isRequiredString,
			default: '',
		},
		group: {
			type: String,
			validate: isRequiredString,
			default: '',
		},
		women: {
			type: Number,
			required: true,
			default: 0,
		},
		youth: {
			type: Number,
			required: true,
			default: 0,
		},
		limited: {
			type: Number,
			required: true,
			default: 0,
		},
	},
	rates: {
		matchOdds,
		overUnder15: overUnderRates,
		overUnder25: overUnderRates,
		bothTeamsToScore,
		goalLines,
	},
	cards: {
		one: cards,
		two: cards,
	},
	createdBy: {
		type: String,
		required: true,
		default: new Date().toISOString(),
	},
	modifiedBy: {
		type: String,
		required: true,
		default: new Date().toISOString(),
	},
});
