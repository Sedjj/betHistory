import {Logger} from '@nestjs/common';

/**
 * Класс для стека ошибок
 */
export class ErrorsStack {
	private readonly logger = new Logger(ErrorsStack.name);
	private readonly stack: Map<string, number>;
	// каждый час
	private intervalFoTimer: number = 60 * 60 * 1000;

	constructor() {
		this.stack = new Map();
		setInterval(() => {
			this.clear();
		}, this.intervalFoTimer);
	}

	public setErrorsStack(key: string) {
		if (this.isStack(key)) {
			let count = this.getErrorsStack(key);
			this.stack.set(key, ++count);
		} else {
			this.stack.set(key, 1);
		}
	}

	public isStack(key: string): boolean {
		return this.stack.has(key);
	}

	public getErrorsStack(key: string): number {
		return this.stack.get(key) || 0;
	}

	public clear(): void {
		if (this.stack.size > 0) {
			for (let [key, value] of this.stack) {
				this.logger.debug(ErrorsStack.name, `${key} -- count -- ${value}`);
			}
			this.stack.clear();
		}
	}
}
