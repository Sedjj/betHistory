import {Schema} from 'mongoose';
import {StackType} from '../type/stack.type';

export let StackSchema = new Schema({
	stackId: {
		type: StackType,
		required: true,
		default: StackType.UNUSUAL,
	},
	activeEventIds: [
		{
			type: Number,
			required: true,
			default: 0,
		},
	],
});
