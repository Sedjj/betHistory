/*
import path from 'path';
import config from 'config';
import {log} from '../../utils/logger';
import {readFile} from '../../utils/fsHelpers';
import {getStatistic} from '../../storage/football';
import XlsxTemplate from '../../utils/xlsx-template';

const storagePath: string = config.get<string>('path.storagePath') || process.cwd();
const exportTemplatesDirectory: string = config.get<string>('path.directory.exportTemplates') || 'exportTemplates';
const inputFootball: string = config.get<string>('path.storage.football.inputName') || 'Reports-football-default.xlsx';
const pathInputFootball = path.join(storagePath, exportTemplatesDirectory, inputFootball);

/!**
 * Возвращает заполненый шаблон списка статистики.
 *
 * @param {Number} days количество дней для экспорта
 * @returns {Promise<{statistics: Array} | never>}
 *!/
export function getStatisticsFootball(days = 2) {
	const beforeDate = new Date(new Date().setUTCHours(0, 0, 0, 1));
	const currentDate = new Date(new Date().setUTCHours(23, 59, 59, 59));
	beforeDate.setUTCDate(beforeDate.getUTCDate() - days);
	const props = {
		statistics: [],
	};
	const query = {};
	query['$and'] = [];
	query['$and'].push({modifiedBy: {$gte: beforeDate.toISOString()}});
	query['$and'].push({modifiedBy: {$lte: currentDate.toISOString()}});
	log.debug(`Начало экспорта Statistics с ${beforeDate.toISOString()} по ${currentDate.toISOString()}`);
	return getStatistic(query)
		.then((items: any) => {
			props.statistics = items;
			log.debug(`Подготовлено данных ${items.length}`);
			return props;
		})
		// @ts-ignore
		.then((prop: any) => {
			try {
				return readFile(pathInputFootball)
					.then(file => {
						const template = new XlsxTemplate(file);
						// Replacements take place on first sheet
						template.substitute(1, {
							statistics: prop.statistics.filter((item: { strategy: number; }) => item.strategy === 1)
						});
						template.substitute(2, {
							statistics: prop.statistics.filter((item: { strategy: number; }) => item.strategy === 2)
						});
						template.substitute(3, {
							statistics: prop.statistics.filter((item: { strategy: number; }) => item.strategy === 3)
						});
						template.substitute(4, {
							// @ts-ignore
							statistics: prop.statistics.filter((item: any) => {
								if (item.strategy === 4) {
									if (item.total >= 1.8) {
										return true;
									}
								}
							})
						});
						template.substitute(5, {
							statistics: prop.statistics.filter((item: { strategy: number; }) => item.strategy === 5)
						});
						template.substitute(6, {
							statistics: prop.statistics.filter((item: { strategy: number; }) => item.strategy === 6)
						});
						log.debug('Генерация файла');
						return template.generate({type: 'nodebuffer'});
					});
			} catch (error) {
				log.error(`ExportError statisticList: ${error.message}`);
			}
		});
}*/
