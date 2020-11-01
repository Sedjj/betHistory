import {InjectQueue} from '@nestjs/bull';
import {Injectable, Logger} from '@nestjs/common';
import {Queue} from 'bull';

type QueueDTO = {
	eventId: number;
};

@Injectable()
export class PublishService {
	private readonly logger = new Logger(PublishService.name);

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
		} catch (e) {
			this.logger.debug(`Message not added to the queue-> ${e}`);
		}
	}
}
