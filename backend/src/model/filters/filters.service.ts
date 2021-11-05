import {Injectable, Logger} from '@nestjs/common';
import {IFilters, IFiltersModel} from './type/filters.type';
import {InjectModel} from '@nestjs/mongoose';
import {Model} from 'mongoose';
import {dateStringToShortDateString} from '../../utils/dateFormat';

@Injectable()
export class FiltersService {
	private readonly logger = new Logger(FiltersService.name);

	constructor(@InjectModel('Filters') private readonly filtersModel: Model<IFiltersModel>) {}

	/**
	 * Преобразовывает фильтры в необходимый формат
	 *
	 * @param {IFiltersModel} model статистика
	 *
	 * @return {IFilters}
	 */
	private static mapProps(model: IFiltersModel): IFilters {
		return {
			confId: model.confId,
			groups: model.groups,
			createdBy: model.createdBy ? dateStringToShortDateString(model.createdBy) : undefined,
			modifiedBy: model.modifiedBy ? dateStringToShortDateString(model.modifiedBy) : undefined,
		};
	}

	/**
	 * Создание новой записи в таблице.
	 *
	 * @param {IFilters} param для таблицы
	 * @returns {Promise<IFilters | null>}
	 */
	async create(param: IFilters): Promise<null | IFilters> {
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
			.then((model: IFiltersModel) => {
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
	async getDataByParam(confId: number): Promise<IFilters> {
		return await this.filtersModel
			.findOne({confId})
			.read('secondary')
			.exec()
			.then((model: IFiltersModel | null) => {
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
	 * @param {IFilters} param параметры которые нужно поменять
	 */
	async setDataByParam(param: IFilters): Promise<IFilters | null> {
		return await this.filtersModel
			.findOne({confId: param.confId})
			.read('secondary')
			.exec()
			.then((model: IFiltersModel | null) => {
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
				return model.save().then((x: IFiltersModel) => FiltersService.mapProps(x));
			})
			.catch((error: any) => {
				this.logger.error(`Error set data by param conf param=${JSON.stringify(param)}`);
				throw new Error(error);
			});
	}
}
