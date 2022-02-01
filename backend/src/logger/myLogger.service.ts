import {Injectable, LoggerService} from '@nestjs/common';
import {createLogger, format, Logger, transports} from 'winston';
import {options} from './options';

@Injectable()
export class MyLogger implements LoggerService {
	private logger: Logger;

	constructor() {
		this.initializeLogger();
	}

	initializeLogger() {
		this.logger = createLogger({
			level: 'debug',
			format: format.json(),
			transports: [
				new transports.File(options.fileInfo),
				new transports.File(options.fileError),
				new transports.File(options.fileDebug),
			],
		});
		if (process.env.NODE_ENV !== 'production') {
			this.logger.add(new transports.Console(options.console));
		}
	}

	log(name: string, message: string) {
		this.logger.log('info', `[${name}] ${message}`);
	}

	debug(name: string, message: string) {
		this.logger.log('debug', `[${name}] ${message}`);
	}

	warn(name: string, message: string) {
		this.logger.log('warn', `[${name}] ${message}`);
	}

	error(name: string, message: string, trace?: string) {
		this.logger.error(`[${name}] ${message}`, trace);
	}
}
