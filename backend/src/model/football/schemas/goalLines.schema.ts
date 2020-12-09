import {Schema} from 'mongoose';
import {isRequiredString} from '../utils/check';
import {behindAgainst} from './behindAgainst.schema';

let otherRate = new Schema({
	over: behindAgainst,
	under: behindAgainst,
});

export let goalLines = new Schema({
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
	list: [otherRate],
});
