import {Injectable, Logger} from '@nestjs/common';
import {IStack, IStackModel, StackType} from './type/stack.type';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';

@Injectable()
export class StackDBService {
	private readonly logger = new Logger(StackDBService.name);

	constructor(@InjectModel('Stack') private readonly stackModel: Model<IStackModel>) {}

	/**
	 * Преобразовывает стек в необходимый формат
	 *
	 * @param {IStackModel} model статистика
	 * @return {IStack}
	 */
	private static mapProps(model: IStackModel): IStack {
		return {
			stackId: model.stackId,
			activeEventIds: model.activeEventIds,
		};
	}

	/**
	 * Создание новой записи в таблице.
	 *
	 * @param {IStack} param для таблицы
	 * @returns {Promise<IStack | null>}
	 */
	async create(param: IStack): Promise<null | IStack> {
		let findMatch = await this.stackModel
			.find({
				stackId: param.stackId,
			})
			.exec();
		if (findMatch.length) {
			return Promise.resolve(null);
		}
		let createdFootball = new this.stackModel(param);
		return await createdFootball
			.save()
			.then((model: IStackModel) => {
				this.logger.debug('Stack model created');
				return StackDBService.mapProps(model);
			})
			.catch((error: any) => {
				this.logger.error(`Error create stack param=${JSON.stringify(param)}`);
				throw new Error(error);
			});
	}

	/**
	 * Метод для получения всего стека.
	 *
	 * @param {Number} stackId id объекта конфига
	 */
	async getDataByParam(stackId: StackType): Promise<IStack> {
		return await this.stackModel
			.findOne({stackId})
			.read('secondary')
			.exec()
			.then((model: IStackModel | null) => {
				if (!model) {
					this.logger.error('Stack with not found');
					throw new Error(`Stack with not found: ${stackId}`);
				}
				return StackDBService.mapProps(model);
			})
			.catch((error: any) => {
				this.logger.error(`Error getDataByParam stackId=${stackId}`);
				throw new Error(error);
			});
	}

	/**
	 * Метод для изменения стека.
	 *
	 * @param {IStack} param параметры которые нужно поменять
	 */
	async setDataByParam(param: IStack): Promise<IStack | void> {
		return await this.stackModel
			.findOne({stackId: param.stackId})
			.read('secondary')
			.exec()
			.then((model: IStackModel | null) => {
				if (!model) {
					this.logger.error('Stack with not found');
					throw new Error(`Stack with not found: ${param.stackId}`);
				}

				if (param.activeEventIds !== undefined) {
					this.stackModel
						.findOneAndUpdate(
							{_id: model._id},
							{
								activeEventIds: param.activeEventIds,
							},
							{new: true},
						)
						.read('secondary')
						.exec()
						.then((x: IStackModel) => StackDBService.mapProps(x));
				}
				return Promise.resolve();
			})
			.catch((error: any) => {
				this.logger.error(`Error set data by stack param=${JSON.stringify(param)} error=${JSON.stringify(error)}`);
				throw new Error(error);
			});
	}
}
