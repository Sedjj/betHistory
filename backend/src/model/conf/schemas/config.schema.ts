import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {RateStrategy} from './rateStrategy.schema';
import {Time} from './time.schema';

export type ConfDocument = Config & Document;

@Schema()
export class Config {
	@Prop({required: true, default: 0})
	confId: number;

	/**
	 * Размер ставки
	 */
	@Prop({required: true, default: 0})
	betAmount: number;

	/**
	 * Временные интервалы для парсинга
	 */
	@Prop({required: true, default: []})
	time: Time[];
	/**
	 * Прибавляем к сумме результата матчей
	 */
	@Prop({required: true, default: 0})
	typeRate: number[];

	/**
	 * Math.abs(p1 - p2) < rate
	 */
	@Prop({required: true, default: []})
	rate: RateStrategy[];

	@Prop({required: false, default: new Date().toISOString()})
	createdBy?: string;

	@Prop({required: false, default: new Date().toISOString()})
	modifiedBy?: string;
}

export const ConfigSchema = SchemaFactory.createForClass(Config);
