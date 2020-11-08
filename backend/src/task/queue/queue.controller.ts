import {Controller, Logger, Post} from '@nestjs/common';
import {InjectQueue} from '@nestjs/bull';
import {Queue} from 'bull';

type QueueDTO = {
	eventId: number;
};

@Controller()
export class QueueController {
	private readonly logger = new Logger(QueueController.name);

	constructor(@InjectQueue('tasks') private readonly queueService: Queue<QueueDTO>) {}

	@Post()
	public addJob(eventId: number) {
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
