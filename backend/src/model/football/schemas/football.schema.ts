import {isRequiredString} from '../utils/check';
import {Cards} from './cards.schema';
import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import {Document} from 'mongoose';
import {Score} from './score.schema';
import {Command} from './command.schema';
import {Rates} from './rates.schema';

export type FootballDocument = Football & Document;

@Schema()
export class Football {
	/**
	 * Идентификатор матча с сайта
	 */
	@Prop({required: true, default: '', validate: isRequiredString})
	marketId: string;

	/**
	 * Идентификатор события
	 */
	@Prop({required: true, default: 0})
	eventId: number;
	/**
	 * Стратегия отбора матча
	 */
	@Prop({required: true, default: 0})
	strategy: number;

	/**
	 * время матча в минутах
	 */
	@Prop({required: true, default: 0})
	time: number;

	@Prop({required: true})
	score: Score;

	/**
	 * Прибавляем к сумме результата матчей
	 */
	@Prop({required: true})
	command: Command;

	/**
	 * Прибавляем к сумме результата матчей
	 */
	@Prop({required: true})
	rates: Rates;

	/**
	 * Прибавляем к сумме результата матчей
	 */
	@Prop({required: true})
	cards: Cards;

	@Prop({required: true, default: new Date().toISOString()})
	createdBy: string;

	@Prop({required: true, default: new Date().toISOString()})
	modifiedBy: string;
}

export const FootballSchema = SchemaFactory.createForClass(Football);
