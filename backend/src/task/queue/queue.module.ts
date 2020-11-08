import {Module} from '@nestjs/common';
import {QueueProcessor} from './queue.processor';
/*import {QueueController} from './queue.controller';*/
/*import {BullModule} from '@nestjs/bull';
import config from 'config';*/

/*const host = process.env.NODE_ENV === 'development' ? '127.0.0.1' : '127.0.0.1';
const port = config.get<number>('redis.port');
const password = config.get<string>('redis.password');*/

@Module({
	imports: [
		/*BullModule.registerQueue({
			name: 'task',
			redis: {
				host,
				port,
				password,
			},
		}),*/
	],
	/*controllers: [QueueController],*/
	providers: [QueueProcessor],
	exports: [QueueProcessor],
})
export class QueueModule {}
