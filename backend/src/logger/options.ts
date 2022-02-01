import {Format} from 'logform';
import {format} from 'winston';
import {FileTransportOptions} from 'winston/lib/winston/transports';

let formatFile: Format = format.combine(
	format.timestamp({
		format: 'YYYY-MM-DD HH:mm:ss',
	}),
	format.json(),
	format.printf(info => `[${info.level}]  - ${info.timestamp}  ${info.message}`),
);

let formatConsole: Format = format.combine(
	format.timestamp({
		format: 'YYYY-MM-DD HH:mm:ss',
	}),
	format.splat(),
	format.colorize(),
	format.json(),
	//  [Nest] 4544   - 2020-02-24 13:06:58   [InstanceLoader] MongooseModule dependencies initialized +39ms
	format.printf(({level, timestamp, message}) => `[${level}]  - ${timestamp}  ${message}`),
);

type optionsType = {
	fileInfo: FileTransportOptions;
	fileDebug: FileTransportOptions;
	fileError: FileTransportOptions;
	console: FileTransportOptions;
};

export const options: optionsType = {
	fileInfo: {
		level: 'info',
		filename: process.cwd() + '/logs/info.log',
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
