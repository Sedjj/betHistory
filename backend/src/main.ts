import {NestFactory} from '@nestjs/core';
import config from 'config';
import {AppModule} from './app.module';
import {TelegramBot} from 'nest-telegram/dist';

const port: number = config.get<number>('port');

async function bootstrap() {
	const isDev = process.env.NODE_ENV === 'development';
	const app = await NestFactory.create(AppModule);
	const bot = app.get(TelegramBot);
	if (!isDev) {
		app.use(bot.getMiddleware('hook-path'));
	}
	await app.listen(port);
	console.log('NODE_ENV=', process.env.NODE_ENV);
}

bootstrap();