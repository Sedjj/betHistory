import {NestFactory} from '@nestjs/core';
import config from 'config';
import {AppModule} from './app.module';
import {MyLogger} from './logger/myLogger.service';
import bodyParser from 'body-parser';

const logger = new MyLogger();

const port: number = config.get<number>('port');

async function bootstrap() {
	const app = await NestFactory.create(AppModule, {
		logger: new MyLogger(),
	});
	app.setGlobalPrefix('parser');
	app.enableCors();
	app.use(bodyParser.json({limit: '5mb'}));
	app.use(bodyParser.urlencoded({limit: '5mb', extended: true}));
	await app.listen(port);
	logger.debug(bootstrap.name, `NODE_ENV: ${process.env.NODE_ENV}`);
}

bootstrap();
