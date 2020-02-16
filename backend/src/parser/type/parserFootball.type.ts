type Index = {
	price: number,
	size: number
};

export type Runners = {
	selectionId: number,
	handicap: number,
	description?: {
		runnerName: string,
		metadata: {
			runnerId: string
		}
	},
	state?: {
		sortPriority: number,
		lastPriceTraded: number,
		totalMatched: number,
		status: string
	},
	exchange?: {
		availableToBack: Index[],
		availableToLay: Index[]
	}
};

export type MarketNodes = {
	marketId: string,
	isMarketDataDelayed: boolean,
	state?: {
		betDelay: number,
		bspReconciled: false,
		complete: boolean,
		inplay: false,
		numberOfWinners: number,
		numberOfRunners: number,
		numberOfActiveRunners: number,
		lastMatchTime: string,
		totalMatched: number,
		totalAvailable: number,
		crossMatching: boolean,
		runnersVoidable: false,
		version: number,
		status: string
	},
	description?: {
		persistenceEnabled: boolean,
		bspMarket: false,
		marketName: string,
		marketTime: string,
		suspendTime: string,
		turnInPlayEnabled: boolean,
		marketType: string,
		priceLadderDescription: {
			type: string
		},
		bettingType: string
	},
	rates?: {
		marketBaseRate: number,
		discountAllowed: boolean
	},
	runners: Runners[],
	isMarketDataVirtual: boolean
};

export type EventMarket = {
	eventName?: string,
	countryCode?: string,
	timezone?: string,
	openDate?: string
};

export type EventNodes = {
	eventId: number,
	event: EventMarket,
	marketNodes: MarketNodes[]
};