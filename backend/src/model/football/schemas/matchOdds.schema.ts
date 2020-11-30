import {Schema} from 'mongoose';
import {isRequiredString} from '../utils/check';

export let matchOdds = new Schema({
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
		p1: {
			type: Number,
			required: true,
			default: 0,
		},
		x: {
			type: Number,
			required: true,
			default: 0,
		},
		p2: {
			type: Number,
			required: true,
			default: 0,
		},
		mod: {
			type: Number,
			required: true,
			default: 0,
		},
	},
	against: {
		p1: {
			type: Number,
			required: true,
			default: 0,
		},
		x: {
			type: Number,
			required: true,
			default: 0,
		},
		p2: {
			type: Number,
			required: true,
			default: 0,
		},
		mod: {
			type: Number,
			required: true,
			default: 0,
		},
	},
});
