import {Schema} from 'mongoose';

function isRequiredString(marketId: string): boolean {
	return marketId != null;
}

let rates = new Schema({
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

let otherRates = new Schema({
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

let otherRate = new Schema({
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

let otherRatesInArray = new Schema({
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

let cards = new Schema({
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

export let FootballSchema = new Schema({
	marketId: {
		type: String,
		validate: isRequiredString,
		default: '',
	},
	eventId: {
		type: Number,
		required: true,
		default: 0,
	},
	strategy: {
		type: Number,
		required: true,
		default: 0,
	},
	time: {
		type: Number,
		required: true,
		default: 0,
	},
	score: {
		sc1: {
			type: Number,
			required: true,
			default: 0,
		},
		sc2: {
			type: Number,
			required: true,
			default: 0,
		},
		resulting: {
			type: String,
			validate: isRequiredString,
			default: '',
		},
	},
	command: {
		one: {
			type: String,
			validate: isRequiredString,
			default: '',
		},
		two: {
			type: String,
			validate: isRequiredString,
			default: '',
		},
		group: {
			type: String,
			validate: isRequiredString,
			default: '',
		},
		women: {
			type: Number,
			required: true,
			default: 0,
		},
		youth: {
			type: Number,
			required: true,
			default: 0,
		},
		limited: {
			type: Number,
			required: true,
			default: 0,
		},
	},
	rates: {
		matchOdds: rates,
		under15: otherRates,
		under25: otherRates,
		bothTeamsToScoreYes: otherRates,
		bothTeamsToScoreNo: otherRates,
		allTotalGoals: otherRatesInArray,
	},
	cards: {
		one: cards,
		two: cards,
	},
	createdBy: {
		type: Date,
		default: new Date(),
	},
	modifiedBy: {
		type: Date,
		default: new Date(),
	},
});
