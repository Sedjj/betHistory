import {log} from '../utils/logger';

/**
 * Класс для состояния ставок
 */
export class RateStatus {
	private jobStatus: boolean;

	constructor() {
		this.jobStatus = false;
	}

	public get status(): boolean {
		return this.jobStatus;
	}

	public turnOn(): boolean {
		log.info('Betting mechanism will be enabled');
		return this.jobStatus = true;
	}

	public turnOff(): boolean {
		log.info('Betting mechanism will be stopped');
		return this.jobStatus = false;
	}
}