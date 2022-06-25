import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import mongoose, {Document} from 'mongoose';
import {ExcludeGroupRate} from './excludeGroupRate.schema';

/**
 * Интерфейс для модели mongo
 */
export type FiltersDocument = Filters & Document;

@Schema()
export class Filters {
	@Prop({required: true, default: 0})
	confId: number;

	@Prop({type: [{type: mongoose.Schema.Types.ObjectId, ref: 'ExcludeGroupRate'}]})
	groups: ExcludeGroupRate[];

	@Prop({required: true, default: new Date().toISOString()})
	createdBy: string;

	@Prop({required: true, default: new Date().toISOString()})
	modifiedBy: string;
}

export const FiltersSchema = SchemaFactory.createForClass(Filters);
