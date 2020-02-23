import {MarketNodes} from './byMarket.type';

export type TeamInfoEventDetails = {
	/**
	 * Имя команды
	 */
	name?: string;
	/**
	 * Количество забитых мечей
	 */
	score?: string;
	/**
	 * половина времени
	 */
	halfTimeScore?: string;
	/**
	 * очная оценка
	 */
	fullTimeScore?: string;
	/**
	 * штрафные баллы
	 */
	penaltiesScore?: string;
	/**
	 * Последовательность штрафов
	 */
	penaltiesSequence?: string[];
	/**
	 * количество желтых карточек
	 */
	numberOfYellowCards?: number;
	/**
	 * количество красных карточек
	 */
	numberOfRedCards?: number;
	/**
	 * количество карт
	 */
	numberOfCards?: number;
	/**
	 * количество углов
	 */
	numberOfCorners?: number;
	/**
	 * Количество углов первой половины
	 */
	numberOfCornersFirstHalf?: number;
	/**
	 * Количество углов второй половины
	 */
	numberOfCornersSecondHalf?: number;
	/**
	 * Точки бронирования
	 */
	bookingPoints?: number;
};

export type ScoreEventDetails = {
	home?: TeamInfoEventDetails;
	away?: TeamInfoEventDetails;
	/**
	 * количество желтых карточек
	 */
	numberOfYellowCards?: number;
	/**
	 * количество красных карточек
	 */
	numberOfRedCards?: number;
	/**
	 * количество карт
	 */
	numberOfCards?: number;
	/**
	 * количество углов
	 */
	numberOfCorners?: number;
	/**
	 * Количество углов первой половины
	 */
	numberOfCornersFirstHalf?: number;
	/**
	 * Количество углов второй половины
	 */
	numberOfCornersSecondHalf?: number;
	/**
	 * Точки бронирования
	 */
	bookingPoints?: number;
};

export type StateEventDetails = {
	eventId?: number;
	score?: ScoreEventDetails;
	/**
	 * Время матча
	 */
	timeElapsed?: number;
	/**
	 * Основное время матча
	 */
	elapsedRegularTime?: number;
	/**
	 * Добавочное время матча
	 */
	elapsedAddedTime?: number
	/**
	 *  Добавочные секунды матча
	 */
	timeElapsedSeconds?: number;
	/**
	 * SecondHalfKickOff
	 */
	status?: string;
	/**
	 * SecondHalfKickOff
	 */
	matchStatus?: string;
};

export type RunnersEventDetails = {
	runner1SelectionId?: number;
	runner2SelectionId?: number;
	drawSelectionId?: number;
};

export type EventDetails = {
	eventId?: number;
	/**
	 * 1- футбол
	 */
	eventTypeId?: number;
	marketId?: string;
	/**
	 * Match Odds вид ставки
	 */
	marketName?: string;
	/**
	 * лига
	 */
	competitionName?: string;
	countryCode?: string;
	/**
	 * время начала матча
	 */
	startTime?: string;
	runners?: RunnersEventDetails
	/**
	 * Название первой команды
	 */
	homeName?: string;
	/**
	 * Название второй команды
	 */
	awayName?: string;
	state?: StateEventDetails;
	inPlayBettingStatus?: string;
	marketNodes?: MarketNodes[]
};