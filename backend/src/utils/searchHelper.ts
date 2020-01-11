/**
 * Cравниваем Total 2-x таймов не изменился ли.
 * Eсли изменился то меняем даные в таблице .
 * {
 * 		конечный = (исходный счет + typeRate) -> 1
 * 		конечный < (исходный счет + typeRate) -> 0
 * 		конечный > (исходный счет  + typeRate) -> ставка(1.666)
 * }
 * @param {Object} startScore исходные данные Total
 * @param {Object} endScore результирующие данные Total
 * @param {Number} typeRate тип ставки
 * @returns {*}
 */
export function equalsTotalOver(startScore: any, endScore: any, typeRate: number) {
	const start = startScore.sc1 + startScore.sc2 + typeRate;
	const end = endScore.sc1 + endScore.sc2;
	if (start === end) {
		return 1;
	} else if (start > end) {
		return 0;
	} else {
		return null;
	}
}

/**
 * Cравниваем Total 2-x таймов не изменился ли.
 * Eсли изменился то меняем даные в таблице .
 * {
 * 		конечный = (исходный счет + typeRate) -> 1
 * 		конечный > (исходный счет + typeRate) -> 0
 * 		конечный < (исходный счет  + typeRate) -> ставка(1.666)
 * }
 * @param {Object} startScore исходные данные Total
 * @param {Object} endScore результирующие данные Total
 * @param {Number} typeRate тип ставки
 * @returns {*}
 */
export function equalsTotalUnder(startScore: any, endScore: any, typeRate: number) {
	const start = startScore.sc1 + startScore.sc2 + typeRate;
	const end = endScore.sc1 + endScore.sc2;
	if (start === end) {
		return 1;
	} else if (start < end) {
		return 0;
	} else {
		return null;
	}
}

/**
 * Cравниваем Total 2-x таймов не изменился ли.
 * Eсли изменился то меняем даные в таблице .
 *
 * @param {Object} endScore результирующие данные Total
 * @returns {*}
 */
export function areEqualTotal(endScore: any) {
	return endScore.sc1 !== endScore.sc2 ? null : 0;
}

/**
 * Метод для сравниея счета матча.
 *
 * @param {Object} oldScore исходный счет матча
 * @param {Object} endScore текущий счет матча
 * @returns {boolean}
 */
export function equalsScore(oldScore: any, endScore: any) {
	return (oldScore.sc1 === endScore.sc1) && (oldScore.sc2 === endScore.sc2);
}

/**
 * Метод для получения счета в тенисе.
 *
 * @param {Map} sets результаты в каждом сете
 * @returns {{sc1: number, sc2: number}}
 */
export function countScore(sets: Map<any, any>) {
	const score = {
		sc1: 0,
		sc2: 0,
	};
	sets.forEach((value) => {
		if (value.sc1 > value.sc2) {
			score.sc1++;
		} else {
			score.sc2++;
		}
	});
	return score;
}

/**
 * Метод для получения счета в конкретном сете в тенисе.
 *
 * @param {Map} sets результаты в каждом сете
 * @param {Number} count номер сета
 * @returns {{sc1: number, sc2: number}}
 */
export function getScoreToSet(sets: Map<any, any>, count: number) {
	let score = {
		sc1: 0,
		sc2: 0,
	};
	if (sets.has(count)) {
		score = sets.get(count);
	}
	return score;
}