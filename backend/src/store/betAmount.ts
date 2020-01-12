import {log} from '../utils/logger';
/*import config from 'config';*/

// const betAmount: number = config.get<number>('emulator.betAmount');

/**
 * Класс для размера ставки
 */
export class BetAmount {
	private amount: number;

	constructor() {
		this.amount = 10;
	}

	public get bets(): number {
		return this.amount;
	}

	public increase(amount: number): number {
		log.info(`Betting increments will on ${amount}`);
		return this.amount = this.amount + amount;
	}

	public decrease(amount: number): number {
		log.info(`Betting decrements will on ${amount}`);
		return this.amount = this.amount - amount;
	}
}