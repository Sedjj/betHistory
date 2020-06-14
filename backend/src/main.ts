import {NestFactory} from '@nestjs/core';
import config from 'config';
import {AppModule} from './app.module';
import {WinstonModule} from 'nest-winston';
import {configWinston} from './utils/logger';

const port: number = config.get<number>('port');

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: WinstonModule.createLogger(configWinston)
	});
	app.enableCors();
	await app.listen(port);
	console.log('NODE_ENV=', process.env.NODE_ENV);
}

bootstrap();