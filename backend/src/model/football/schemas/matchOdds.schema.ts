import {Schema} from 'mongoose';
import {isRequiredString} from '../utils/check';
import {behindAgainst} from './behindAgainst.schema';

export let matchOdds = new Schema({
	marketId: {
		type: String,
		validate: isRequiredString,
		default: '',
	},
	status: {
		type: String,
		validate: isRequiredString,
		default: '',
	},
	totalMatched: {
		type: Number,
		required: true,
		default: 0,
	},
	p1: behindAgainst,
	x: behindAgainst,
	p2: behindAgainst,
	mod: behindAgainst,
});
