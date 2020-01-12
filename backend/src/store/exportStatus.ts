import {log} from '../utils/logger';

/**
 * Класс для состояния экспорта'
 */
export class ExportStatus {
	/**
	 * Название метода для экспорта
	 */
	private nameMethod: string;
	/**
	 * Количест дней экспорта
	 */
	private countDay: number;

	constructor() {
		this.clear();
	}

	public get count(): number {
		return this.countDay;
	}

	public get name(): string {
		return this.nameMethod;
	}

	public setName(name: string): void {
		log.info(`Name export -: ${name}`);
		this.nameMethod = name;
	}

	public increase(amount: number): number {
		log.info(`Export increments will on ${amount}`);
		return this.countDay = this.countDay + amount;
	}

	public decrease(amount: number): number {
		log.info(`Export decrements will on ${amount}`);
		return this.countDay = this.countDay - amount;
	}

	public clear(): void {
		this.nameMethod = '';
		this.countDay = 2;
	}
}