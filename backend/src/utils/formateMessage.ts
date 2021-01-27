import {IFootball} from '../model/football/type/football.type';

/**
 * Форматирование строки для чата.
 *
 * @param {IFootball} param объект матча
 * @returns {string}
 */
export function decorateMessageChat(param: IFootball): string {
	const {
		marketId,
		eventId,
		command: {one, two, group},
		rates: {
			matchOdds: {p1, x, p2},
			overUnder15: {
				marketId: market15,
				under: {behind: TM15},
			},
			overUnder25: {
				under: {behind: TM25},
			},
			bothTeamsToScore: {
				no: {behind: OZ},
			},
		},
		score: {sc1, sc2},
		time,
	} = param;
	const scope = `${sc1}:${sc2}`;
	const index = `${p1.behind} / ${x.behind} / ${p2.behind}`;
	const difference = `${TM15} / ${TM25} / ${OZ}:НЕТ`;
	const mobile = `<a href="https://www.betfair.com/exchange/football/event/${eventId}/multi-market?marketIds${marketId}">mobile</a>`;
	const pc = `<a href="https://www.betfair.com/exchange/plus/football/market/${marketId}">pc</a>`;
	const orbitx = `<a href="https://www.orbitExch.com/customer/sport/market/${market15}">orbitx</a>`;
	return `${mobile} / ${pc} / ${orbitx}\n${group}\n\n<b>${one}\n${two}</b>\n\n<pre>${scope} / ${time}'\n${index}\n${difference}</pre>`;
}

/**
 * Форматирование строки для канала.
 *
 * @param {IFootball} param объект матча
 * @returns {string}
 */
export function decorateMessageChannel(param: IFootball): string {
	const {
		command: {one, two, group},
		rates: {
			overUnder25: {
				marketId: market25,
				under: {behind: TM25},
				over: {behind: TB25},
			},
			bothTeamsToScore: {
				no: {behind: OZ},
			},
		},
		score: {sc1, sc2},
		time,
	} = param;
	const scope = `${sc1}:${sc2}`;
	const difference = `${TM25} / ${TB25} / ${OZ}:НЕТ`;
	const orbitx = `<a href="https://www.orbitExch.com/customer/sport/market/${market25}">Id</a>`;
	return `${orbitx}\n${group}\n\n<b>${one}\n${two}</b>\n\n<pre>${scope} / ${time}'\n${difference}</pre>`;
}
