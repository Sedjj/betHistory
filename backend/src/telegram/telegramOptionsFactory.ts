import {TelegramModuleOptions, TelegramModuleOptionsFactory} from 'nest-telegram/dist';
import config from 'config';

export class TelegramOptionsFactory implements TelegramModuleOptionsFactory {
	private readonly token: string;

	constructor() {
		if (process.env.NODE_ENV === 'development') {
			this.token = config.get<string>('bots.supportDev.token');
		} else {
			this.token = config.get<string>('bots.supportProd.token');
		}
	}

	createOptions(): TelegramModuleOptions {
		return {
			token: this.token,
			sitePublicUrl: 'http://localhost:3000',
		};
	}
}