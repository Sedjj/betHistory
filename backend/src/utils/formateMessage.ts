import {IFootball} from '../football/type/football.type';

/**
 * Метод для округления дробного число
 * @param {Number} value число для округления
 * @param {Number} rlength число до которого округляем
 * @returns {number}
 */
function round(value: number, rlength = 2) {
	let temp = value;
	if (typeof value === 'number') {
		temp = Number((value).toFixed(rlength));
	}
	return temp;
}

/**
 * Форматирование строки вывода для тениса.
 *
 * @param {IFootball} param объект матча
 * @returns {String}
 */
export function decorateMessageTennis(param: IFootball): string {
	const {
		marketId,
		command: {one, two, group},
	} = param;
	return `<code>${marketId}</code>\n${group}\n\n<b>${one}\n${two}</b>`;
}

/**
 * Форматирование строки для канала.
 *
 * @param {IFootball} param объект матча
 * @returns {string}
 */
export function decorateMessageChannel(param: IFootball): string {
	const {
		marketId,
		command: {one, two, group},
		rates: {matchOdds: {behind: {p1, x, p2}}},
		score: {sc1, sc2},
		time
	} = param;
	const scope = `${sc1}:${sc2}`;
	const index = `${p1} / ${x} / ${p2}`;
	const difference = `${round(x - p1)} / ${round(x - p2)} / ${round(p2 - p1)}`;
	return `<code>${marketId}</code>\n${group}\n\n<b>${one}\n${two}</b>\n\n<pre>${scope} / ${time}'\n${index}\n${difference}</pre>`;
}