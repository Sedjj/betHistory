import fs, {ReadStream} from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * Генерирует рандомное имя файла
 *
 * @param {String} directory путь к файлу
 * @param {String} extension расширение файла
 * @returns {Promise}
 */
export function generateName(directory: string, extension = null) {
	return new Promise((resolve, reject) => {
		crypto.pseudoRandomBytes(16, (error, buffer) => {
			if (error) {
				reject(error);
			} else {
				resolve(path.join(directory, buffer.toString('hex') + (extension ? '.' + extension : '')));
			}
		});
	});
}

/**
 * Сохраняет buffer в файл
 *
 * @param {String} filePath путь к файлу
 * @param {*} buffer массив байтов
 * @returns {Promise}
 */
export function saveBufferToFile(filePath: string, buffer: any): Promise<string> {
	return new Promise((resolve, reject) => {
		const writeStream = fs.createWriteStream(filePath);
		writeStream.write(buffer, error => {
			if (error) {
				reject(error);
			} else {
				resolve(filePath);
			}
			writeStream.end();
		});
	});
}

/**
 * Считывает файл в stream
 *
 * @param {String} filePath путь к файлу
 * @returns {Promise}
 */
export function readFileToStream(filePath: string): Promise<ReadStream> {
	return new Promise((resolve, reject) => {
		const readStream = fs.createReadStream(filePath);
		readStream.on('error', err => {
			reject(err);
		});
		resolve(readStream);
	});
}


/**
 * Считывает файл в sync
 *
 * @param {String} filePath путь к файлу
 * @returns {Promise}
 */
export function readFileSync(filePath: string): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		const readStream: Buffer = fs.readFileSync(filePath);
		resolve(readStream);
	});
}

/**
 * Удаляет файл
 *
 * @param {String} filePath путь к файлу
 * @returns {Promise}
 */
export function deleteFile(filePath: string) {
	return new Promise((resolve, reject) => {
		fs.unlink(filePath, error => {
			if (error) {
				reject(error);
			} else {
				resolve(filePath);
			}
		});
	});
}

/**
 * Перемещает файл
 *
 * @returns {Promise}
 * @param {String} oldPath текущий путь к файлу
 * @param {String} newPath путь к файлу, куда нужно переместить
 */
export function moveFile(oldPath: string, newPath: string) {
	return new Promise((resolve, reject) => {
		fs.rename(oldPath, newPath, error => {
			if (error) {
				reject(error);
			} else {
				resolve(newPath);
			}
		});
	});
}

/**
 * Копирует файл
 *
 * @returns {Promise}
 * @param {String} oldPath текущий путь к файлу
 * @param {String} newPath новый путь к файлу
 */
export function copyFile(oldPath: string, newPath: string) {
	return new Promise((resolve, reject) => {
		fs.copyFile(oldPath, newPath, error => {
			if (error) {
				reject(error);
			} else {
				resolve(newPath);
			}
		});
	});
}

/**
 * Считывает файл
 *
 * @param {String} filePath путь к файлу
 * @returns {Promise}
 */
export function readFile(filePath: string): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		fs.readFile(filePath, (error, file) => {
			if (error) {
				reject(error);
			} else {
				resolve(file);
			}
		});
	});
}