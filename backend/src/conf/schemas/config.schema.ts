import {Schema} from 'mongoose';

let Time = new Schema({
	before: {
		type: Number,
		required: true,
		default: 0
	},
	after: {
		type: Number,
		required: true,
		default: 0
	},
});

let RateStrategy = new Schema({
	title: {
		type: String,
		required: true,
		default: ''
	},
	rate: {
		type: Number,
		required: true,
		default: 0
	},
});

export let ConfigSchema = new Schema({
	confId: {
		type: Number,
		required: true,
		default: 0
	},
	betAmount: {
		type: Number,
		required: true,
		default: 0
	},
	time: [Time],
	typeRate: [{
		type: Number,
		required: true,
		default: 0
	}],
	rate: [RateStrategy],
	createdBy: {
		type: String,
		required: true,
		default: (new Date()).toISOString()
	},
	modifiedBy: {
		type: String,
		required: true,
		default: (new Date()).toISOString()
	}
});