export type AvailableMarketNodes = {
	/**
	 * Коэфициент ставки
	 */
	price?: number;
};

export type ExchangeMarketNodes = {
	/**
	 * За
	 */
	availableToBack?: AvailableMarketNodes[];
	/**
	 * Против
	 */
	availableToLay?: AvailableMarketNodes[];
};

export enum StatusMarket {
	CLOSE = 'CLOSE',
	OPEN = 'OPEN',
	SUSPENDED = 'SUSPENDED',
}

export type Status = 'OPEN' | 'SUSPENDED' | 'CLOSE';

export type StateMarketNodes = {
	/**
	 * Enum статус маркета
	 */
	status: Status;
};

export type DescriptionMarketNodes = {
	/**
	 * Название биржи
	 */
	marketName?: string;
	/**
	 * Enum биржи
	 */
	marketType?: string;
};

export type RunnersMarketNodes = {
	selectionId?: number;
	handicap?: number;
	description?: {
		runnerName?: string;
	};
	exchange?: ExchangeMarketNodes;
};

export type MarketNodes = {
	marketId?: string;
	state?: StateMarketNodes;
	description?: DescriptionMarketNodes;
	runners?: RunnersMarketNodes[];
};
