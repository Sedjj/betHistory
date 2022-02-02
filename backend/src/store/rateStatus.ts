import {Logger} from '@nestjs/common';

/**
 * Класс для состояния ставок
 */
export class RateStatus {
	private readonly logger = new Logger(RateStatus.name);
	private jobStatus: boolean;

	constructor() {
		this.jobStatus = false;
	}

	public get status(): boolean {
		return this.jobStatus;
	}

	public turnOn(): boolean {
		this.logger.debug(RateStatus.name, 'Betting mechanism will be enabled');
		return (this.jobStatus = true);
	}

	public turnOff(): boolean {
		this.logger.debug(RateStatus.name, 'Betting mechanism will be stopped');
		return (this.jobStatus = false);
	}
}
