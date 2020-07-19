import fs from 'fs';

/**
 * Сохраняет buffer в файл
 *
 * @param {String} filePath путь к файлу
 * @param {Buffer} buffer массив байтов
 * @returns {Promise}
 */
export function saveBufferToFile(filePath: string, buffer: Buffer): Promise<string> {
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
