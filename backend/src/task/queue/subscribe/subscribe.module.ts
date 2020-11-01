import {Module} from '@nestjs/common';
import {BullModule} from '@nestjs/bull';
import config from 'config';
import {SubscribeService} from './subscribe.service';

const host = process.env.NODE_ENV === 'development' ? '127.0.0.1' : 'redis';
const port = config.get<number>('redis.port');
const password = config.get<string>('redis.password');

@Module({
	imports: [
		BullModule.registerQueue({
			name: 'task',
			redis: {
				host,
				port,
				password,
			},
		}),
	],
	providers: [SubscribeService],
	exports: [SubscribeService],
})
export class SubscribeModule {}
