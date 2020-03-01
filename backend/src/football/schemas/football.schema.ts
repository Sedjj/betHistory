import {Schema} from 'mongoose';

let rates = new Schema({
	behind: {
		p1: {
			type: Number,
			required: true,
			default: 0
		},
		x: {
			type: Number,
			required: true,
			default: 0
		},
		p2: {
			type: Number,
			required: true,
			default: 0
		},
		mod: {
			type: Number,
			required: true,
			default: 0
		}
	},
	against: {
		p1: {
			type: Number,
			required: true,
			default: 0
		},
		x: {
			type: Number,
			required: true,
			default: 0
		},
		p2: {
			type: Number,
			required: true,
			default: 0
		},
		mod: {
			type: Number,
			required: true,
			default: 0
		}
	}
});

let rateOther = new Schema({
	behind: {
		type: Number,
		required: true,
		default: 0
	},
	against: {
		type: Number,
		required: true,
		default: 0
	}
});

let cards = new Schema({
	red: {
		type: Number,
		default: 0
	},
	yellow: {
		type: Number,
		default: 0
	},
	corners: {
		type: Number,
		default: 0
	},
	attacks: {
		type: Number,
		default: 0
	},
	danAttacks: {
		type: Number,
		default: 0
	},
	shotsOn: {
		type: Number,
		default: 0
	},
	shotsOff: {
		type: Number,
		default: 0
	}
});

export let FootballSchema = new Schema({
	marketId: {
		type: String,
		required: true,
		default: ''
	},
	eventId: {
		type: Number,
		required: true,
		default: 0
	},
	strategy: {
		type: Number,
		required: true,
		default: 0
	},
	time: {
		type: Number,
		required: true,
		default: 0
	},
	score: {
		sc1: {
			type: Number,
			required: true,
			default: 0
		},
		sc2: {
			type: Number,
			required: true,
			default: 0
		},
		resulting: {
			type: String,
			default: ''
		},
	},
	command: {
		one: {
			type: String,
			required: true,
			default: ''
		},
		two: {
			type: String,
			required: true,
			default: ''
		},
		group: {
			type: String,
			default: ''
		},
		women: {
			type: Number,
			required: true,
			default: 0
		},
		youth: {
			type: Number,
			required: true,
			default: 0
		},
		limited: {
			type: Number,
			required: true,
			default: 0
		}
	},
	rates: {
		matchOdds: rates,
		under15: rateOther,
		under25: rateOther,
		bothTeamsToScoreYes: rateOther,
		bothTeamsToScoreNo: rateOther,
		allTotalGoals: rateOther,
	},
	cards: {
		one: cards,
		two: cards
	},
	createdBy: {
		type: Date,
		default: new Date()
	},
	modifiedBy: {
		type: Date,
		default: new Date()
	}
});