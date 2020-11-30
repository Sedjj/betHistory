import {Schema} from 'mongoose';

export let cards = new Schema({
	red: {
		type: Number,
		default: 0,
	},
	yellow: {
		type: Number,
		default: 0,
	},
	corners: {
		type: Number,
		default: 0,
	},
	attacks: {
		type: Number,
		default: 0,
	},
	danAttacks: {
		type: Number,
		default: 0,
	},
	shotsOn: {
		type: Number,
		default: 0,
	},
	shotsOff: {
		type: Number,
		default: 0,
	},
});
