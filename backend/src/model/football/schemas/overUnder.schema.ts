import {Schema} from 'mongoose';
import {isRequiredString} from '../utils/check';
import {behindAgainst} from './behindAgainst.schema';

export let overUnderRates = new Schema({
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
	over: behindAgainst,
	under: behindAgainst,
});
