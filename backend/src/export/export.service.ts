import {Injectable} from '@nestjs/common';
import config from 'config';
import {readFile} from '../utils/fsHelpers';
import path from 'path';
import {FootballService} from '../model/football/football.service';
// @ts-ignore
import Workbook from 'xlsx-template';
import {IFootball} from '../model/football/type/football.type';
import {ExcelProps} from './type/export.type';
import {MyLogger} from '../logger/myLogger.service';

@Injectable()
export class ExportService {
	private readonly storagePath: string;
	private readonly outputFootball: string;
	private readonly inputFootball: string;
	private readonly exportTemplatesDirectory: string;
	private readonly pathInputFootball: string;

	constructor(private readonly footballService: FootballService, private readonly log: MyLogger) {
		this.storagePath = config.get<string>('path.storagePath') || process.cwd();
		this.exportTemplatesDirectory = config.get<string>('path.directory.exportTemplates') || 'exportTemplates';
		this.inputFootball = config.get<string>('path.storage.football.inputName') || 'Reports-football-default.xlsx';
		this.outputFootball = config.get<string>('path.storage.football.outputName') || 'Reports.xlsx';
		this.pathInputFootball = path.join(this.storagePath, this.exportTemplatesDirectory, this.inputFootball);
	}

	private static mapProps(statistic: IFootball): ExcelProps {
		try {
			return {
				marketId: statistic.marketId,
				strategy: statistic.strategy,
				command: statistic.command.group,
				oneName: statistic.command.one,
				twoName: statistic.command.two,
				women: statistic.command.women,
				youth: statistic.command.youth,
				limited: statistic.command.limited,
				score: statistic.score.sc1 + ':' + statistic.score.sc2,
				time: statistic.time,
				totalMatched: statistic.rates.overUnder25.totalMatched,
				/**
				 * Коэффициенты
				 */
				main: {
					p1: statistic.rates.matchOdds.p1.behind,
					x: statistic.rates.matchOdds.x.behind,
					p2: statistic.rates.matchOdds.p2.behind,
					mod: statistic.rates.matchOdds.mod.behind,
				},
				over15A: statistic.rates.overUnder15.over.against,
				over15B: statistic.rates.overUnder15.over.behind,
				over25B: statistic.rates.overUnder25.over.behind,
				bothTeamsToScoreYes: statistic.rates.bothTeamsToScore.yes.behind,
				bothTeamsToScoreNo: statistic.rates.bothTeamsToScore.no.behind,
				allTotalGoals: statistic.rates.goalLines.list.reduce<number>((acc, x) => {
					if (x.under.handicap === 2.0 || x.under.handicap === 2) {
						acc = x.under.behind;
					}
					return acc;
				}, 0),
				/**
				 * Карты
				 */
				one: {
					corners: statistic.cards.one.corners,
				},
				two: {
					corners: statistic.cards.two.corners,
				},
				/**
				 * Побочные
				 */
				createdBy: statistic.createdBy,
				modifiedBy: statistic.modifiedBy,
				resulting: statistic.score.resulting,
			};
		} catch (error) {
			throw new Error(error);
		}
	}

	/**
	 * Метод для отправки экспорта статистики футбола потоком
	 *
	 * @param {Number} days количество дней для экспорта
	 * @param {Number} startDay стартовый днень для экспорта
	 * @returns {Promise<void>}
	 */
	public async exportFootballStatisticStream(days = 2, startDay = 0): Promise<{filename: string; buffer: Buffer}> {
		try {
			const buffer: Buffer = await this.getStatisticsFootball(days, startDay);
			const filename: string = `${days}days-${this.outputFootball}`;
			this.log.debug(ExportService.name, `Файл statistic ${filename}`);
			return {filename, buffer};
		} catch (error) {
			this.log.error(ExportService.name, `Error send statistic: ${error.message}`);
			throw new Error(error);
		}
	}

	/**
	 * Возвращает заполненный шаблон списка статистики.
	 *
	 * @param {Number} days количество дней для экспорта
	 * @param {Number} startDay стартовый днень для экспорта
	 * @returns {Promise<{statistics: Array} | never>}
	 */
	private getStatisticsFootball(days = 2, startDay = 0): Promise<Buffer> {
		const currentDate = new Date(new Date().setUTCHours(23, 59, 59, 59));
		const beforeDate = new Date(new Date().setUTCHours(0, 0, 0, 1));
		currentDate.setUTCDate(currentDate.getUTCDate() - startDay);
		beforeDate.setUTCDate(beforeDate.getUTCDate() - days - startDay);
		const query = {};
		query['$and'] = [];
		query['$and'].push({modifiedBy: {$gte: beforeDate.toISOString()}});
		query['$and'].push({modifiedBy: {$lte: currentDate.toISOString()}});
		this.log.debug(
			ExportService.name,
			`Начало экспорта Statistics с ${beforeDate.toISOString()} по ${currentDate.toISOString()}`,
		);

		return this.footballService
			.getDataByParam(query)
			.then((items: IFootball[]) => {
				this.log.debug(ExportService.name, 'Преобразование данных');
				return items.reduce<ExcelProps[]>((acc, item) => {
					let res = ExportService.mapProps(item);
					if (res != null) {
						acc.push(res);
					}
					return acc;
				}, []);
			})
			.then(async (prop: ExcelProps[]) => {
				try {
					this.log.debug(ExportService.name, `Подготовлено данных ${prop.length}`);
					let file = await readFile(this.pathInputFootball);
					const template = new Workbook(file);
					template.substitute(1, {
						tr: prop.filter((item: {strategy: number}) => item.strategy === 1),
					});
					template.substitute(2, {
						tr: prop.filter((item: {strategy: number}) => item.strategy === 2),
					});
					template.substitute(3, {
						tr: prop.filter((item: {strategy: number}) => item.strategy === 3),
					});
					template.substitute(4, {
						tr: prop.filter((item: {strategy: number}) => item.strategy === 4),
					});
					template.substitute(5, {
						tr: prop.filter((item: {strategy: number}) => item.strategy === 5),
					});
					template.substitute(6, {
						tr: prop.filter((item: {strategy: number}) => item.strategy === 6),
					});
					template.substitute(7, {
						tr: prop.filter((item: {strategy: number}) => item.strategy === 7),
					});
					this.log.debug(ExportService.name, 'Генерация файла');
					return template.generate<Buffer>({type: 'nodebuffer'});
				} catch (error) {
					this.log.error(ExportService.name, `ExportError statisticList: ${error.message}`);
					throw new Error(error);
				}
			});
	}
}
