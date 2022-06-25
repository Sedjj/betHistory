import {Injectable, Logger} from '@nestjs/common';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {dateStringToShortDateString} from '../../utils/dateFormat';
import {Filters, FiltersDocument} from './schemas/filters.schema';

@Injectable()
export class FiltersService {
	private readonly logger = new Logger(FiltersService.name);

	constructor(@InjectModel(Filters.name) private readonly filtersModel: Model<FiltersDocument>) {}

	/**
	 * Преобразовывает фильтры в необходимый формат
	 *
	 * @param {FiltersDocument} model статистика
	 *
	 * @return {Filters}
	 */
	private static mapProps(model: FiltersDocument): Filters {
		return {
			confId: model.confId,
			groups: model.groups,
			createdBy: dateStringToShortDateString(model.createdBy),
			modifiedBy: dateStringToShortDateString(model.modifiedBy),
		};
	}

	/**
	 * Создание новой записи в таблице.
	 *
	 * @param {Filters} param для таблицы
	 * @returns {Promise<Filters | null>}
	 */
	async create(param: Filters): Promise<null | Filters> {
		let findMatch = await this.filtersModel
			.find({
				confId: param.confId,
			})
			.exec();
		if (findMatch.length) {
			return Promise.resolve(null);
		}
		let createdFilters = new this.filtersModel(param);
		return await createdFilters
			.save()
			.then((model: FiltersDocument) => {
				this.logger.debug('Filters model created');
				return FiltersService.mapProps(model);
			})
			.catch((error: any) => {
				this.logger.error(`Error create filters param=${JSON.stringify(param)}`);
				throw new Error(error);
			});
	}

	/**
	 * Метод для получения фильтров конфигурации.
	 *
	 * @param {Number} confId id объекта конфига
	 */
	async getDataByParam(confId: number): Promise<Filters> {
		return await this.filtersModel
			.findOne({confId})
			.read('secondary')
			.exec()
			.then((model: FiltersDocument | null) => {
				if (!model) {
					this.logger.error('Filters with not found');
					throw new Error(`Filters with not found: ${confId}`);
				}
				return FiltersService.mapProps(model);
			})
			.catch((error: any) => {
				this.logger.error(`Error getDataByParam confId=${confId}`);
				throw new Error(error);
			});
	}

	/**
	 * Метод для изменения фильтров.
	 *
	 * @param {Filters} param параметры которые нужно поменять
	 */
	async setDataByParam(param: Filters): Promise<Filters | null> {
		return await this.filtersModel
			.findOne({confId: param.confId})
			.read('secondary')
			.exec()
			.then((model: FiltersDocument | null) => {
				if (!model) {
					this.logger.error('Filters with not found');
					throw new Error(`Filters with not found: ${param.confId}`);
				}
				if (param.groups !== undefined) {
					model.groups = param.groups;
				}
				if (param.modifiedBy !== undefined) {
					model.modifiedBy = param.modifiedBy;
				}
				return model.save().then((x: FiltersDocument) => FiltersService.mapProps(x));
			})
			.catch((error: any) => {
				this.logger.error(`Error set data by param conf param=${JSON.stringify(param)}`);
				throw new Error(error);
			});
	}
}
