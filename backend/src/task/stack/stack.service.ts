import {Injectable, Logger, OnApplicationBootstrap} from '@nestjs/common';
import {IStack} from '../../model/stack/type/stack.type';
import {EventDetails} from '../../parser/type/eventDetails.type';
import {StackDBService} from '../../model/stack/stackDB.service';

@Injectable()
export class StackService implements OnApplicationBootstrap {
	private readonly logger = new Logger(StackService.name);
	private activeEventIds: number[] = [];

	constructor(private readonly stackDBService: StackDBService) {}

	async onApplicationBootstrap() {
		let stack: null | IStack = await this.stackDBService.create({
			stackId: 1,
			activeEventIds: [],
		});
		if (stack != null) {
			this.logger.debug(`Stack migration in bd`);
		} else {
			this.activeEventIds = await this.getActiveEvent();
		}
		this.logger.debug(`start active event ids: ${this.activeEventIds.length ? this.activeEventIds.join() : 0}`);
	}

	public getActiveEventIds(): number[] {
		return this.activeEventIds;
	}

	public getStringEventIds(): string[] {
		const arraySize: number = 50;
		let res: string[] = [];
		for (let i = 0; i < this.activeEventIds.length; i += arraySize) {
			res.push(this.activeEventIds.slice(i, i + arraySize).join());
		}
		return res;
	}

	public getLengthEvent(): number {
		return this.activeEventIds.length;
	}

	/**
	 * Метод для добавления событий в активные
	 *
	 * @param {Number} id идентификатор события
	 */
	public increaseActiveEventId = async (id: number): Promise<void> => {
		if (!this.activeEventIds.includes(id)) {
			this.activeEventIds.push(id);
			await this.setActiveEvent(this.activeEventIds);
		}
	};

	/**
	 * Метод для обновления активных событий.
	 *
	 * @param {EventDetails[]} eventDetails детальная информация о событии на бирже
	 */
	public decreaseActiveEventId = async (eventDetails: EventDetails[]): Promise<void> => {
		this.activeEventIds = eventDetails.reduce<number[]>((acc, eventDetail) => {
			if (eventDetail.eventId) {
				acc.push(eventDetail.eventId);
			}
			return acc;
		}, []);
		await this.setActiveEvent(this.activeEventIds);
	};

	private async getActiveEvent(): Promise<number[]> {
		let activeEventIds: number[] = [];
		try {
			let model: IStack = await this.stackDBService.getDataByParam(1);
			activeEventIds = model.activeEventIds;
		} catch (error) {
			this.logger.error(`Error get active event ids`);
		}
		return activeEventIds;
	}

	private async setActiveEvent(ids: number[]): Promise<void> {
		try {
			await this.stackDBService.setDataByParam({
				stackId: 1,
				activeEventIds: ids,
			});
		} catch (error) {
			this.logger.error(`Error set active event ids`);
		}
	}
}
