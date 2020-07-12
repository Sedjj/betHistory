import {NestFactory} from '@nestjs/core';
import config from 'config';
import {AppModule} from './app.module';
import {WinstonModule} from 'nest-winston';
import {configWinston} from './utils/logger';
import bodyParser from 'body-parser';

const port: number = config.get<number>('port');

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: WinstonModule.createLogger(configWinston),
	});
	app.setGlobalPrefix('parser');
	app.enableCors();
	app.use(bodyParser.json({limit: '5mb'}));
	app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
	await app.listen(port);
	console.log('NODE_ENV=', process.env.NODE_ENV);
}

bootstrap();
