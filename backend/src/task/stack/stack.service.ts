import {Injectable, OnApplicationBootstrap} from '@nestjs/common';
import {StackType} from '../../model/stack/type/stack.type';
import {EventDetails} from '../../parser/type/eventDetails.type';
import {StackDBService} from '../../model/stack/stackDB.service';
import {IActiveEvent} from './stack.type';
import {MyLogger} from '../../logger/myLogger.service';
import {Stack} from '../../model/stack/schemas/stack.schema';

@Injectable()
export class StackService implements OnApplicationBootstrap {
	private readonly activeEventIds: IActiveEvent;
	private normalStackLimit: number = 70;

	constructor(private readonly stackDBService: StackDBService, private readonly log: MyLogger) {
		this.activeEventIds = {
			often: [],
			unusual: [],
		};
	}

	async onApplicationBootstrap() {
		let stackUsually: null | Stack = await this.stackDBService.create({
			stackId: StackType.UNUSUAL,
			activeEventIds: [],
		});
		let stackOften: null | Stack = await this.stackDBService.create({
			stackId: StackType.OFTEN,
			activeEventIds: [],
		});

		if (stackUsually != null && stackOften != null) {
			this.log.debug(StackService.name, `Stack migration in bd`);
			this.log.debug(StackService.name, `Start active event ids: 0`);
		} else {
			this.activeEventIds.unusual = await this.getActiveEvent(StackType.UNUSUAL);
			this.activeEventIds.often = await this.getActiveEvent(StackType.OFTEN);
			const length = this.activeEventIds.unusual.length + this.activeEventIds.often.length;
			const list = [...this.activeEventIds.unusual, ...this.activeEventIds.often].join();

			this.log.debug(StackService.name, `start active event ids: ${length ? list : 0}`);
		}
	}

	public getStringEventIds(stackType: StackType): string[] {
		const arraySize: number = 45;
		let res: string[] = [];
		for (let i = 0; i < this.activeEventIds[stackType].length; i += arraySize) {
			res.push(this.activeEventIds[stackType].slice(i, i + arraySize).join());
		}
		return res;
	}

	public getLengthEvent(stackType: StackType): number {
		return this.activeEventIds[stackType].length;
	}

	/**
	 * Метод для добавления событий в активные
	 *
	 * @param {StackType} stackType тип очереди
	 * @param {Number} id идентификатор события
	 */
	public increaseActiveEventId = async (stackType: StackType, id: number): Promise<void> => {
		if (!this.activeEventIds[stackType].includes(id)) {
			this.activeEventIds[stackType].push(id);
			await this.setActiveEvent(stackType, this.activeEventIds[stackType]);
		}
	};

	/**
	 * Метод для обновления активных событий.
	 *
	 * @param {StackType} stackType тип очереди
	 * @param {EventDetails[]} eventDetails детальная информация о событии на бирже
	 */
	public decreaseActiveEventId = async (stackType: StackType, eventDetails: EventDetails[]): Promise<void> => {
		let activeEventUsually: number[] = [];
		let activeEventOften: number[] = [];
		eventDetails.forEach(eventDetail => {
			if (eventDetail.state?.timeElapsed && eventDetail.eventId) {
				if (eventDetail.state?.timeElapsed >= this.normalStackLimit) {
					activeEventOften.push(eventDetail.eventId);
				} else {
					activeEventUsually.push(eventDetail.eventId);
				}
			}
		});
		if (stackType === StackType.UNUSUAL) {
			this.activeEventIds.unusual = activeEventUsually;
			if (activeEventOften.length > 0) {
				this.activeEventIds.often.push(...activeEventOften.filter(x => !this.activeEventIds.often.includes(x)));
			}
		}
		if (stackType === StackType.OFTEN) {
			this.activeEventIds.often = activeEventOften;
			if (activeEventUsually.length > 0) {
				this.activeEventIds.unusual.push(...activeEventUsually.filter(x => !this.activeEventIds.unusual.includes(x)));
			}
		}

		await this.setActiveEvent(StackType.UNUSUAL, this.activeEventIds.unusual);
		await this.setActiveEvent(StackType.OFTEN, this.activeEventIds.often);
	};

	private async getActiveEvent(stackType: StackType): Promise<number[]> {
		let activeEventIds: number[] = [];
		try {
			let model: Stack = await this.stackDBService.getDataByParam(stackType);
			activeEventIds = model.activeEventIds;
		} catch (error) {
			this.log.error(StackService.name, `Error get active event ids`);
		}
		return activeEventIds;
	}

	private async setActiveEvent(stackType: StackType, ids: number[]): Promise<void> {
		try {
			await this.stackDBService.setDataByParam({
				stackId: stackType,
				activeEventIds: ids,
			});
		} catch (error) {
			this.log.error(StackService.name, `Error set active event ids`);
		}
	}
}
