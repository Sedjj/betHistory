import {createLogger, format, Logger, LoggerOptions, transports} from 'winston';
import {FileTransportOptions} from 'winston/lib/winston/transports';
import {Format} from 'logform';

let formatFile: Format = format.combine(
	format.timestamp({
		format: 'YYYY-MM-DD HH:mm:ss',
	}),
	format.json(),
	format.printf(info => `[${info.level}]  - ${info.timestamp}   [${info.context}] ${info.message}`),
);

let formatConsole: Format = format.combine(
	format.timestamp({
		format: 'YYYY-MM-DD HH:mm:ss',
	}),
	format.splat(),
	format.colorize(),
	format.json(),
	//  [Nest] 4544   - 2020-02-24 13:06:58   [InstanceLoader] MongooseModule dependencies initialized +39ms
	format.printf(({level, timestamp, context, message}) => `[${level}]  - ${timestamp}   [${context}] ${message}`),
);

type optionsType = {
	fileInfo: FileTransportOptions;
	fileDebug: FileTransportOptions;
	fileError: FileTransportOptions;
	console: FileTransportOptions;
};

const options: optionsType = {
	fileInfo: {
		level: 'info',
		filename: process.cwd() + '/logs/all.log',
		handleExceptions: true,
		maxsize: 5242880, // 5MB
		maxFiles: 5,
		format: formatFile,
	},
	fileDebug: {
		level: 'debug',
		filename: process.cwd() + '/logs/debug.log',
		handleExceptions: true,
		maxsize: 5242880, // 5MB
		maxFiles: 5,
		format: formatFile,
	},
	fileError: {
		level: 'error',
		filename: process.cwd() + '/logs/error.log',
		handleExceptions: true,
		maxsize: 5242880, // 5MB
		maxFiles: 5,
		format: formatFile,
	},
	console: {
		level: 'debug',
		handleExceptions: true,
		format: formatConsole,
	},
};

const configWinston: LoggerOptions = {
	level: 'debug',
	transports: [
		new transports.File(options.fileInfo),
		new transports.File(options.fileError),
		new transports.File(options.fileDebug),
		new transports.Console(options.console),
	],
};

/**
 * Обертка над логером для дополнительных действий
 */
class WrapperLogger {
	private logger: Logger;

	constructor(send?: string) {
		// this.send = send;
		this.logger = createLogger(configWinston);
	}

	info(message: string) {
		this.logger.info(message);
	}

	debug(message: string) {
		this.logger.debug(message);
	}

	error(message: string) {
		this.logger.error(message);
		// this.send(message);
	}
}

const log: WrapperLogger = new WrapperLogger();

export {configWinston, log};
