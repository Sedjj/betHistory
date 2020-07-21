import {IFootball} from '../model/football/type/football.type';

/**
 * Форматирование строки для канала.
 *
 * @param {IFootball} param объект матча
 * @returns {string}
 */
export function decorateMessageChannel(param: IFootball): string {
	const {
		marketId,
		eventId,
		command: {one, two, group},
		rates: {
			matchOdds: {
				behind: {p1, x, p2},
			},
			under15: {behind: TM15},
			under25: {behind: TM25},
			bothTeamsToScoreNo: {behind: OZ},
		},
		score: {sc1, sc2},
		time,
	} = param;
	const scope = `${sc1}:${sc2}`;
	const index = `${p1} / ${x} / ${p2}`;
	const difference = `${TM15} / ${TM25} / ${OZ}:НЕТ`;
	let mobile = `<a href="https://www.betfair.com/exchange/football/event/${eventId}/multi-market?marketIds${marketId}">mobile</a>`;
	let pc = `<a href="https://www.betfair.com/exchange/plus/football/market/${marketId}">pc</a>`;
	return `${mobile} / ${pc}\n${group}\n\n<b>${one}\n${two}</b>\n\n<pre>${scope} / ${time}'\n${index}\n${difference}</pre>`;
}
