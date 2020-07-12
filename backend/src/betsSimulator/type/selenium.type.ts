export type PlaceOrders = {
	marketId: string;
	layOrBack: 'lay' | 'back';
	choice: {
		selectionId: number;
		handicap: number;
	};
	bet: {
		/**
		 * Odds
		 */
		price: number;
		/**
		 * Stake
		 */
		stake: number;
	};
};
