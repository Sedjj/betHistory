import {Logger} from '@nestjs/common';

/**
 * Класс для размера ставки
 */
export class BetAmount {
	private readonly logger = new Logger(BetAmount.name);
	private amount: number;

	constructor() {
		this.amount = 10;
	}

	public get bets(): number {
		return this.amount;
	}

	public increase(amount: number): number {
		this.logger.debug(BetAmount.name, `Betting increments will on ${amount}`);
		return (this.amount = this.amount + amount);
	}

	public decrease(amount: number): number {
		this.logger.debug(BetAmount.name, `Betting decrements will on ${amount}`);
		return (this.amount = this.amount - amount);
	}
}
