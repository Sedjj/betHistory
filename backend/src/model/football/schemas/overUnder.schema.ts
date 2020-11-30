import {Schema} from 'mongoose';
import {isRequiredString} from '../utils/check';

export let overUnderRates = new Schema({
	selectionId: {
		type: Number,
		required: true,
		default: 0,
	},
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
	handicap: {
		type: Number,
		required: true,
		default: 0,
	},
	behind: {
		over: {
			type: Number,
			required: true,
			default: 0,
		},
		under: {
			type: Number,
			required: true,
			default: 0,
		},
	},
	against: {
		over: {
			type: Number,
			required: true,
			default: 0,
		},
		under: {
			type: Number,
			required: true,
			default: 0,
		},
	},
});
