import {Schema} from 'mongoose';

export let behindAgainst = new Schema({
	selectionId: {
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
		type: Number,
		required: true,
		default: 0,
	},
	against: {
		type: Number,
		required: true,
		default: 0,
	},
});
