import {NestFactory} from '@nestjs/core';
import config from 'config';
import {AppModule} from './app.module';

const port: number = config.get<number>('port');

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	await app.listen(port);
	console.log('NODE_ENV=', process.env.NODE_ENV);
}

bootstrap();