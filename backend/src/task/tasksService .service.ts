import {Injectable, Logger, OnApplicationBootstrap} from '@nestjs/common';
import {Cron} from '@nestjs/schedule';

@Injectable()
export class TasksService implements OnApplicationBootstrap {
	private readonly logger = new Logger(TasksService.name);

	onApplicationBootstrap() {
		this.logger.debug('****start scheduler search football****');
		this.logger.debug('****start scheduler checking results****');
	}

	// @Cron((process.env.NODE_ENV === 'development') ? '*/10 * * * * *' : '*/02 * * * *')
	searchFootball() {
		this.logger.debug('Called when the current second is 10');
	}

	@Cron((process.env.NODE_ENV === 'development') ? '*/45 * * * * *' : '00 05 10 * * 0-7')
	checkingResults() {
		if (process.env.NODE_ENV !== 'development') {
			this.logger.debug('Called when the current second is 45');
		}
	}
}