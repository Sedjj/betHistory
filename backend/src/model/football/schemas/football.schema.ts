import { isRequiredString } from "../utils/check";
import { Cards } from "./cards.schema";
import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose";
import { Document } from "mongoose";
import { Score } from "./score.schema";
import { Command } from "./command.schema";
import { Rates } from "./rates.schema";

export type FootballDocument = Football & Document;

@Schema()
export class Football {
  /**
   * Идентификатор матча с сайта
   */
  @Prop({ required: true, default: "", validate: isRequiredString })
  marketId: string;

  /**
   * Идентификатор события
   */
  @Prop({ required: true, default: 0 })
  eventId: number;
  /**
   * Стратегия отбора матча
   */
  @Prop({ required: true, default: 0 })
  strategy: number;

  /**
   * время матча в минутах
   */
  @Prop({ required: true, default: 0 })
  time: number;

  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Score" }] })
  score: Score;

  /**
   * Прибавляем к сумме результата матчей
   */
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Сommand" }] })
  command: Command;

  /**
   * Прибавляем к сумме результата матчей
   */
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rates" }] })
  rates: Rates;

  /**
   * Прибавляем к сумме результата матчей
   */
  @Prop({ type: [{ type: mongoose.Schema.Types.ObjectId, ref: "Cards" }] })
  cards: Cards;

  @Prop({ required: true, default: (new Date()).toISOString() })
  createdBy: string;

  @Prop({ required: true, default: (new Date()).toISOString() })
  modifiedBy: string;
}

export const FootballSchema = SchemaFactory.createForClass(Football);