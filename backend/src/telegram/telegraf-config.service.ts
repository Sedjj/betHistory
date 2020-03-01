import {Injectable} from '@nestjs/common';
import {TelegrafModuleOptions, TelegrafOptionsFactory} from 'nestjs-telegraf';
import config from 'config';

@Injectable()
export class TelegrafConfigService implements TelegrafOptionsFactory {
	createTelegrafOptions(): TelegrafModuleOptions {
		let token: string;
		if (process.env.NODE_ENV === 'development') {
			token = config.get<string>('bots.dev.token');
		} else {
			token = config.get<string>('bots.prod.token');
		}
		return {token};
	}
}