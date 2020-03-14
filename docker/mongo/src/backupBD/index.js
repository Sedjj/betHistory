const {mongoimport} = require('../mongopack');
const path = require('path');
const exec = require('child_process').exec;

let database = 'rateBotNest';
let dbUri = 'mongodb://localhost:27017/rateBotNest';

let archivesPath = process.cwd();
let archivesDirectory = 'upload';
let objectPath = path.join(archivesPath, archivesDirectory);

let options = {
	type: 'json', // default is csv
	pretty: true, // gives a pretty formatted json in output file
};

/**
 * Метод для сворачивания дампа.
 *
 * @param {String} collection название коллекции
 */
function exportBackup(collection) {
	if (!collection) {
		return;
	}
	console.info('Начало архивирования БД');
	const command = `mongodb-backup ${dbUri} -c '["${collection}"]' -p json -o ${path.join(objectPath, `${collection}.json`)}`;
	console.info(command);
	return execShell(command)
		.then((error) => {
			if (error) {
				console.error(`exportBackup: ${error}`);
				throw new Error();
			}
			console.info('Закончилось архивирования БД');
			return readFileToStream(path.join(objectPath, `${collection}.json`))
		})
		.catch((error) => {
			console.error(`Упал метод exportBackup - ${error} - для: ${collection.toString()}`);
		});
}

/**
 * Метод для разворачивания коллекции.
 *
 * @param {String} collection название коллекции
 */
function importBackup(collection) {
	if (!collection) {
		return;
	}
	console.info('Начало востановление БД');
	mongoimport(database, collection, path.join(objectPath, `${collection}.json`), options)
		.then((error) => {
			if (error) {
				console.error(`importBackup: ${error}`);
				throw new Error();
			}
			console.info('Закончилось востановление БД');
		})
		.catch((error) => {
			console.error(`Упал метод importBackup - ${error} - для: ${collection.toString()}`);
		});
}

/**
 * Функция выполнения shell команд.
 *
 * @param {String} cmd команда для выполнения
 * @returns {Promise<any>}
 */
function execShell(cmd) {
	return new Promise((resolve, reject) => {
		exec(cmd, (error, stdout) => {
			if (error !== undefined && error !== null) {
				reject(error.message);
			}
			resolve(stdout);
		});
	});
}

/**
 * Считывает файл в stream
 *
 * @param {String} filePath путь к файлу
 * @returns {Promise}
 */
function readFileToStream(filePath) {
	return new Promise((resolve, reject) => {
		const readStream = fs.createReadStream(filePath);
		readStream.on('error', err => {
			reject(err);
		});
		resolve(readStream);
	});
}

module.exports = {
	exportBackup,
	importBackup
};