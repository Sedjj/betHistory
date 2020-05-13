import {Schema} from 'mongoose';

export let StackSchema = new Schema({
	stackId: {
		type: Number,
		required: true,
		default: 0
	},
	activeEventIds: [{
		type: Number,
		required: true,
		default: 0
	}],
});