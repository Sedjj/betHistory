import {Logger} from '@nestjs/common';

/**
 * Класс для состояния экспорта'
 */
export class ExportStatus {
	private readonly logger = new Logger(ExportStatus.name);
	/**
	 * Название метода для экспорта
	 */
	private nameMethod: string;
	/**
	 * Количество дней экспорта
	 */
	private countDay: number;
	/**
	 * День начала экспорта
	 */
	private currentDay: number;

	constructor() {
		this.clear();
	}

	public get count(): number {
		return this.countDay;
	}

	public get day(): number {
		return this.currentDay;
	}

	public get name(): string {
		return this.nameMethod;
	}

	public setName(name: string): void {
		this.logger.debug(`Name export: ${name}`);
		this.nameMethod = name;
	}

	public increase(amount: number): number {
		this.logger.debug(`Export increments will on ${amount}`);
		return (this.countDay = this.countDay + amount);
	}

	public decrease(amount: number): number {
		this.logger.debug(`Export decrements will on ${amount}`);
		return (this.countDay = this.countDay - amount);
	}

	public increaseDay(amount: number): number {
		this.logger.debug(`Export increments day will on ${amount}`);
		return (this.currentDay = this.currentDay + amount);
	}

	public decreaseDay(amount: number): number {
		this.logger.debug(`Export decrements day will on ${amount}`);
		return (this.currentDay = this.currentDay - amount);
	}

	public clear(): void {
		this.nameMethod = '';
		this.countDay = 2;
		this.currentDay = 0;
	}
}
