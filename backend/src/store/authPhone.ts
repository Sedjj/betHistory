import {log} from '../utils/logger';

/**
 * Класс для подтвержения телефона
 */
export class AuthPhone {
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

	public 	get status(): boolean {
		return this.checkStatus;
	}

	public setPhone(phone: string): void {
		log.info(`Confirmation phone: ${phone}`);
		this.currentPhone = phone;
	}

	public setCode(code: string): void {
		log.info(`Verification code: ${code}`);
		this.currentCode = code;
	}

	public turnOn(): boolean {
		log.info('Enable login verification');
		return this.checkStatus = true;
	}

	public turnOff(): boolean {
		log.info('Stopped login verification');
		return this.checkStatus = false;
	}
}