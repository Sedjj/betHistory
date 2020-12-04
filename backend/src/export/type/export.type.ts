/**
 * Интерфейс соответствий с файлом
 */
export type ExcelProps = {
	marketId: string;
	strategy: number;
	command: string;
	oneName: string;
	twoName: string;
	women: number;
	youth: number;
	limited: number;
	score: string;
	time: number;
	/**
	 * Сумма ставок
	 */
	totalMatched: number;
	/**
	 * Коэффициенты
	 */
	main: {
		p1: number;
		x: number;
		p2: number;
		mod: number;
	};
	under15: number;
	under25: number;
	over25: number;
	bothTeamsToScoreYes: number;
	bothTeamsToScoreNo: number;
	allTotalGoals: number;
	/**
	 * Карты
	 */
	one: {
		corners: number;
	};
	two: {
		corners: number;
	};
	/**
	 * Побочные
	 */
	createdBy: string;
	resulting: string;
};
