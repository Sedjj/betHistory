import {Injectable, Logger} from '@nestjs/common';
import config from 'config';
import {readFile, saveBufferToFile} from '../utils/fsHelpers';
import path from 'path';
import {FootballService} from '../model/football/football.service';
// @ts-ignore
import Workbook from 'xlsx-template';
import {IFootball} from '../model/football/type/football.type';
import {ExcelProps} from './type/export.type';

@Injectable()
export class ExportService {
	private readonly logger = new Logger(ExportService.name);
	private readonly storagePath: string;
	private readonly uploadDirectory: string;
	private readonly outputFootball: string;
	private readonly inputFootball: string;
	private readonly exportTemplatesDirectory: string;
	private readonly pathInputFootball: string;

	constructor(private readonly footballService: FootballService) {
		this.storagePath = config.get<string>('path.storagePath') || process.cwd();
		this.uploadDirectory = config.get<string>('path.directory.upload') || 'upload';
		this.exportTemplatesDirectory = config.get<string>('path.directory.exportTemplates') || 'exportTemplates';
		this.inputFootball = config.get<string>('path.storage.football.inputName') || 'Reports-football-default.xlsx';
		this.outputFootball = config.get<string>('path.storage.football.outputName') || 'Reports.xlsx';
		this.pathInputFootball = path.join(this.storagePath, this.exportTemplatesDirectory, this.inputFootball);
	}

	/**
	 * Преобразовывает статистику в необходимый формат
	 *
	 * @param {IFootballModel} statistic статистика
	 * @return {Object}
	 */
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
				/**
				 * Коэффициенты
				 */
				main: {
					p1: statistic.rates.matchOdds.behind.p1,
					x: statistic.rates.matchOdds.behind.x,
					p2: statistic.rates.matchOdds.behind.p2,
					mod: statistic.rates.matchOdds.behind.mod,
				},
				under15: statistic.rates.under15.behind,
				under25: statistic.rates.under25.behind,
				bothTeamsToScoreYes: statistic.rates.bothTeamsToScoreYes.behind,
				bothTeamsToScoreNo: statistic.rates.bothTeamsToScoreNo.behind,
				allTotalGoals: statistic.rates.allTotalGoals.list.reduce<number>((acc, x) => {
					if (x.handicap === 2.0) {
						acc = x.behind;
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
				resulting: statistic.score.resulting,
			};
		} catch (error) {
			throw new Error(error);
		}
	}

	/**
	 * Метод для отправки экспорта статистики футбола
	 *
	 * @param {Number} days количество дней для экспорта
	 * @returns {Promise<void>}
	 */
	public async exportFootballStatistic(days: number): Promise<string> {
		try {
			const file: Buffer = await this.getStatisticsFootball(days);
			const filePath: string = await saveBufferToFile(
				path.join(this.storagePath, this.uploadDirectory, `${days}days-${this.outputFootball}`),
				file,
			);
			this.logger.debug(`Файл statistic отправлен ${filePath}`);
			return filePath;
		} catch (error) {
			this.logger.error(`Error send statistic: ${error.message}`);
			throw new Error(error);
		}
	}

	/**
	 * Возвращает заполненый шаблон списка статистики.
	 *
	 * @param {Number} days количество дней для экспорта
	 * @returns {Promise<{statistics: Array} | never>}
	 */
	private getStatisticsFootball(days = 2): Promise<Buffer> {
		const beforeDate = new Date(new Date().setUTCHours(0, 0, 0, 1));
		const currentDate = new Date(new Date().setUTCHours(23, 59, 59, 59));
		beforeDate.setUTCDate(beforeDate.getUTCDate() - days);
		const query = {};
		query['$and'] = [];
		query['$and'].push({modifiedBy: {$gte: beforeDate.toISOString()}});
		query['$and'].push({modifiedBy: {$lte: currentDate.toISOString()}});
		this.logger.debug(`Начало экспорта Statistics с ${beforeDate.toISOString()} по ${currentDate.toISOString()}`);

		return this.footballService
			.getDataByParam(query)
			.then((items: IFootball[]) =>
				items.reduce<ExcelProps[]>((acc, item) => {
					let res = ExportService.mapProps(item);
					if (res != null) {
						acc.push(res);
					}
					return acc;
				}, []),
			)
			.then(async (prop: ExcelProps[]) => {
				try {
					this.logger.debug(`Подготовлено данных ${prop.length}`);
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
					this.logger.debug('Генерация файла');
					return template.generate<Buffer>({type: 'nodebuffer'});
				} catch (error) {
					this.logger.error(`ExportError statisticList: ${error.message}`);
					throw new Error(error);
				}
			});
	}
}
