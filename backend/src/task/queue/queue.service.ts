import {InjectQueue} from '@nestjs/bull';
import {Injectable, Logger} from '@nestjs/common';
import {Queue} from 'bull';

type QueueDTO = {
	eventId: number;
};

@Injectable()
export class QueueService {
	private readonly logger = new Logger(QueueService.name);

	constructor(@InjectQueue('tasks') private readonly queueService: Queue<QueueDTO>) {}

	public addQueueWithDelay(eventId: number): void {
		try {
			this.queueService
				.add(
					'wait',
					{
						eventId,
					},
					{
						delay: 2 * 60 * 1000,
					},
				)
				.then(() => {
					this.logger.debug(`Successfully added ${eventId} to the queue`);
				});
			this.queueService.on('completed', (job, result) => {
				this.logger.log(`Job ${job.name} completed! Result: ${result}`);
			});

			this.queueService.on('failed', (job, err) => {
				this.logger.error(err);
			});
		} catch (e) {
			this.logger.debug(`Message not added to the queue-> ${e}`);
		}
	}
}
