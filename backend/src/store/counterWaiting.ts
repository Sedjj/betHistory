import {log} from '../utils/logger';

/**
 * Класс для подсчета ожидающих матчей
 */
export class CounterWaiting {
	private waitingEndCount: number;

	constructor() {
		this.waitingEndCount = 0;
	}

	public get count(): number {
		return this.waitingEndCount;
	}

	public set count(waitingEndCount: number) {
		this.waitingEndCount = waitingEndCount;
	}

	public increment(): number {
		log.debug(`Всего в очереди на окончание матча: ${this.waitingEndCount + 1}`);
		return this.waitingEndCount++;
	}

	public decrement(): number {
		log.debug(`Всего в очереди на окончание матча осталось: ${this.waitingEndCount - 1}`);
		return this.waitingEndCount--;
	}
}