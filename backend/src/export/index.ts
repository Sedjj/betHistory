/*
import path from 'path';
import config from 'config';
import {log} from '../utils/logger';
import {saveBufferToFile, readFileToStream} from '../utils/fsHelpers';
import {sendFile} from '../telegram/api';
import {getStatisticsFootball} from './football';
import {ReadStream} from 'fs';

const storagePath: string = config.get<string>('path.storagePath') || process.cwd();
const uploadDirectory: string = config.get<string>('path.directory.upload') || 'upload';
const outputFootball: string = config.get<string>('path.storage.football.outputName') || 'Reports.xlsx';

/!**
 * Метод для отправки экспорта статистики футбола
 *
 * @param {Number} days количество дней для экспорта
 * @returns {Promise<void>}
 *!/
export async function exportFootballStatistic(days: number) {
	try {
		const file = await getStatisticsFootball(days);
		const filePath: string = await saveBufferToFile(path.join(storagePath, uploadDirectory, `${days}days-${outputFootball}`), file);
		const stream: ReadStream = await readFileToStream(filePath);
		await sendFile(stream);
		log.debug('Файл statistic отправлен');
	} catch (error) {
		log.error(`Send statistic: ${error.message}`);
	}
}*/
