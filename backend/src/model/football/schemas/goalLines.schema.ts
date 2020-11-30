import {Schema} from 'mongoose';
import {isRequiredString} from '../utils/check';

let otherRate = new Schema({
	handicap: {
		type: Number,
		required: true,
		default: 0,
	},
	behind: {
		Over: {
			type: Number,
			required: true,
			default: 0,
		},
		Under: {
			type: Number,
			required: true,
			default: 0,
		},
	},
	against: {
		Over: {
			type: Number,
			required: true,
			default: 0,
		},
		Under: {
			type: Number,
			required: true,
			default: 0,
		},
	},
});

export let goalLines = new Schema({
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
	list: [otherRate],
});
