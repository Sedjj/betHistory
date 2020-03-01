import {registerAs} from '@nestjs/config';
import config from 'config';

interface IConfig {
	token: string;
}

export default registerAs(
	'bot',
	(): IConfig => {
		let token: string;
		if (process.env.NODE_ENV === 'development') {
			token = config.get<string>('bots.dev.token');
		} else {
			token = config.get<string>('bots.prod.token');
		}
		return {token};
	},
);