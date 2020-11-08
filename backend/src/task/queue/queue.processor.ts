import {Process, Processor} from '@nestjs/bull';
import {Job} from 'bull';

type QueueDTO = {
	eventId: number;
};

@Processor('task')
export class QueueProcessor {
	private eventIds: number[] = [];

	@Process('wait')
	public async handleTranscode(job: Job<QueueDTO>) {
		this.increaseEventId(job.data.eventId);
	}

	public getEventIds(): number[] {
		return this.eventIds;
	}

	public getStringEventIds(): string {
		return this.eventIds.join();
	}

	public getLengthEvent(): number {
		return this.eventIds.length;
	}

	public decreaseEventId(ids: number[]) {
		ids.forEach(id => {
			const index = this.eventIds.indexOf(id);
			if (index > -1) {
				this.eventIds.splice(index, 1);
			}
		});
	}

	private increaseEventId(eventId: number) {
		this.eventIds.push(eventId);
	}
}