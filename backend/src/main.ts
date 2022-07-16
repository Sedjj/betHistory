import {NestFactory} from '@nestjs/core';
import config from 'config';
import {AppModule} from './app.module';
import {MyLogger} from './logger/myLogger.service';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';

const logger = new MyLogger();

const port: number = config.get<number>('port');

export async function bootstrap() {
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

export async function testConnectToMongoose() {
	await mongoose.connect(
		`mongodb://${config.get<string>('dbDev.hostString')}${config.get<string>('dbDev.name')}`,
	);
	// mongoose.set('debug', true);
	const kittySchema = new mongoose.Schema({
		name: String,
	});
	const Kitten = mongoose.model('Kitten', kittySchema);
	const silence = new Kitten({name: 'Silence'});
	console.log('testConnectToMongoose', silence.name);
}

// testConnectToMongoose();

bootstrap();
