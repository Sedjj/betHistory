import {Schema} from 'mongoose';

let ExcludeGroupRate = new Schema({
	name: {
		type: String,
		required: true,
		default: '',
	},
	enable: {
		type: Number,
		required: true,
		default: 0,
	},
});

export let FiltersSchema = new Schema({
	confId: {
		type: Number,
		required: true,
		default: 0,
	},
	groups: [ExcludeGroupRate],
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
