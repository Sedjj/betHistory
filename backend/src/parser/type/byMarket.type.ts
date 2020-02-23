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
		runnerName?: string,
	},
	exchange?: ExchangeMarketNodes;
};

export type MarketNodes = {
	marketId?: string;
	description?: DescriptionMarketNodes;
	runners?: RunnersMarketNodes[];
};