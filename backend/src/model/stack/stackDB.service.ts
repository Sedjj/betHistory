import { Injectable } from "@nestjs/common";
import { StackType } from "./type/stack.type";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MyLogger } from "../../logger/myLogger.service";
import { Stack, StackDocument } from "./schemas/stack.schema";

@Injectable()
export class StackDBService {
	constructor(
		@InjectModel(Stack.name) private readonly stackModel: Model<StackDocument>,
		private readonly log: MyLogger
	) {
	}

	private static mapProps(model: Stack): Stack {
		return {
			stackId: model.stackId,
			activeEventIds: model.activeEventIds
		};
	}

	async create(param: Stack): Promise<null | Stack> {
		let findMatch = await this.stackModel
			.find({
				stackId: param.stackId
			})
			.exec();
		if (findMatch.length) {
			return Promise.resolve(null);
		}
		let createdFootball = new this.stackModel(param);
		return await createdFootball
			.save()
			.then((model: Stack) => {
				this.log.debug(StackDBService.name, "Stack model created");
				return StackDBService.mapProps(model);
			})
			.catch((error: any) => {
				this.log.error(StackDBService.name, `Error create stack param=${JSON.stringify(param)}`);
				throw new Error(error);
			});
	}

	/**
	 * Метод для получения всего стека.
	 *
	 * @param {Number} stackId id объекта конфига
	 */
	async getDataByParam(stackId: StackType): Promise<Stack> {
		return await this.stackModel
			.findOne({ stackId })
			.read("secondary")
			.exec()
			.then((model: StackDocument | null) => {
				if (!model) {
					this.log.error(StackDBService.name, "Stack with not found");
					throw new Error(`Stack with not found: ${stackId}`);
				}
				return StackDBService.mapProps(model);
			})
			.catch((error: any) => {
				this.log.error(StackDBService.name, `Error getDataByParam stackId=${stackId}`);
				throw new Error(error);
			});
	}

	/**
	 * Метод для изменения стека.
	 *
	 * @param {Stack} param параметры которые нужно поменять
	 */
	async setDataByParam(param: Stack): Promise<Stack | void> {
		return await this.stackModel
			.findOne({ stackId: param.stackId })
			// .read('secondary')
			.exec()
			.then((model: StackDocument | null) => {
				if (!model) {
					this.log.error(StackDBService.name, "Stack with not found");
					throw new Error(`Stack with not found: ${param.stackId}`);
				}

				if (param.activeEventIds !== undefined) {
					this.stackModel
						.findOneAndUpdate(
							{ _id: model._id },
							{
								activeEventIds: param.activeEventIds
							},
							{ new: true }
						)
						// .read('secondary')
						.exec()
						.then((x: StackDocument | null) => {
							if (!x) {
								this.log.error(StackDBService.name, "Stack with not found");
								throw new Error(`Stack with not found: ${param.stackId}`);
							}
							return StackDBService.mapProps(x);
						});
				}
				return Promise.resolve();
			})
			.catch((error: any) => {
				this.log.error(
					StackDBService.name,
					`Error set data by stack param=${JSON.stringify(param)} error=${JSON.stringify(error)}`,
				);
				throw new Error(error);
			});
	}
}
