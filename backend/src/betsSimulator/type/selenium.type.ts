export type PlaceOrders = {
	marketId: string;
	layOrBack: 'lay' | 'back';
	choice: {
		selectionId: number;
		handicap: number;
	}
	bet: {
		price: number;
		stake: number;
	}
};