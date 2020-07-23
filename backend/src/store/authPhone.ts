import {Logger} from '@nestjs/common';

/**
 * Класс для подтверждения телефона
 */
export class AuthPhone {
	private readonly logger = new Logger(AuthPhone.name);
	private checkStatus: boolean;
	private currentPhone: string;
	private currentCode: string;

	constructor() {
		this.currentPhone = '';
		this.currentCode = '';
		this.checkStatus = false;
	}

	public get phone(): string {
		return this.currentPhone;
	}

	public get code(): string {
		return this.currentCode;
	}

	public get status(): boolean {
		return this.checkStatus;
	}

	public setPhone(phone: string): void {
		this.logger.debug(`Confirmation phone: ${phone}`);
		this.currentPhone = phone;
	}

	public setCode(code: string): void {
		this.logger.debug(`Verification code: ${code}`);
		this.currentCode = code;
	}

	public turnOn(): boolean {
		this.logger.debug('Enable login verification');
		return (this.checkStatus = true);
	}

	public turnOff(): boolean {
		this.logger.debug('Stopped login verification');
		return (this.checkStatus = false);
	}
}
