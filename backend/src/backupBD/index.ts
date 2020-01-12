/*import {mongoimport} from '../../vendor/mongopack';*/
import {log} from '../utils/logger';
import path from 'path';
import config from 'config';
import {ReadStream} from 'fs';

/*const {sendFile} = require('../telegram/api');*/
import {readFileToStream} from '../utils/fsHelpers';
import {exec} from 'child_process';

/*const database = process.env.NODE_ENV === 'development'
	? config.get<string>('dbDev.name')
	: config.get<string>('dbProd.name');*/

const dbUri = process.env.NODE_ENV === 'development'
	? `mongodb://${config.get<string>('dbDev.user')}:${encodeURIComponent(config.get<string>('dbDev.pass'))}@${config.get<string>('dbDev.hostString')}${config.get<string>('dbDev.name')}`
	: `mongodb://${config.get<string>('dbProd.user')}:${encodeURIComponent(config.get<string>('dbProd.pass'))}@${config.get<string>('dbProd.hostString')}${config.get<string>('dbProd.name')}`;

const archivesPath = config.get<string>('path.storagePath') || process.cwd();
const archivesDirectory = config.get<string>('path.directory.upload') || 'upload';
const objectPath = path.join(archivesPath, archivesDirectory);

/*const options = {
	type: 'json', // default is csv
	pretty: true, // gives a pretty formatted json in output file
};*/

/**
 * Метод для сворачивания дампа.
 *
 * @param {String} collection название коллекции
 */
export function exportBackup(collection: string): void {
	if (!collection) {
		return;
	}
	log.info('Начало архивирования БД');
	const command = `mongodb-backup ${dbUri} -c '["${collection}"]' -p json -o ${path.join(objectPath, `${collection}.json`)}`;
	log.info(command);
	execShell(command)
		.then((error) => {
			if (error) {
				log.error(`exportBackup: ${error}`);
				throw new Error();
			}
			log.info('Закончилось архивирования БД');
			readFileToStream(path.join(objectPath, `${collection}.json`))
				.then((stream: ReadStream) => {
					/*sendFile(stream);*/
					log.debug('Файл statistic отправлен');
				});
		})
		.catch((error) => {
			log.error(`Упал метод exportBackup - ${error} - для: ${collection.toString()}`);
		});
}

/**
 * Метод для разворачивания коллекции.
 *
 * @param {String} collection название коллекции
 */
export function importBackup(collection: string) {
	if (!collection) {
		return;
	}
	log.info('Начало востановление БД');
	/*mongoimport(database, collection, path.join(objectPath, `${collection}.json`), options)
		.then((error: any) => {
			if (error) {
				log.error(`importBackup: ${error}`);
				throw new Error();
			}
			log.info('Закончилось востановление БД');
		})
		.catch((error: any) => {
			log.error(`Упал метод importBackup - ${error} - для: ${collection.toString()}`);
		});*/
}

/**
 * Функция выполнения shell команд.
 *
 * @param {String} cmd команда для выполнения
 * @returns {Promise<any>}
 */
function execShell(cmd: string) {
	return new Promise((resolve, reject) => {
		exec(cmd, (error: any, stdout: string) => {
			if (error !== undefined && error !== null) {
				reject(error.message);
			}
			resolve(stdout);
		});
	});
}