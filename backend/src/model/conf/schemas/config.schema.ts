import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {Document} from 'mongoose';
import {Time} from './time.schema';
import {RateStrategy} from './rateStrategy.schema';

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
	@Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'Time'}]})
	time: Time[];

	/**
	 * Прибавляем к сумме результата матчей
	 */
	@Prop({required: true, default: 0})
	typeRate: number[];

	/**
	 * Math.abs(p1 - p2) < rate
	 */
	@Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'RateStrategy'}]})
	rate: RateStrategy[];

	@Prop({required: false, default: new Date().toISOString()})
	createdBy?: string;

	@Prop({required: false, default: new Date().toISOString()})
	modifiedBy?: string;
}

export const ConfigSchema = SchemaFactory.createForClass(Config);
