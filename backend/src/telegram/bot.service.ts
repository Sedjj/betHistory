/*
import {Injectable, OnModuleInit} from '@nestjs/common';
import {throttle} from '../utils/throttle';
import {rateStatus, rateAmount, counterWaiting} from '../store';
/!*import {exportBackup} from '../backupBD';*!/
import {use} from 'node-telegram-bot-api-middleware';
import {readFileToStream} from '../utils/fsHelpers';
/!*import {sendFile} from '../api';*!/
import {menuList} from './menu';
import TelegramBot from 'node-telegram-bot-api';
/!*import {
	exportFootballStatistic,
	exportTableTennisStatistic,
	exportTennisStatistic,
	exportBasketballStatistic
} from '../../export';*!/
import config from 'config';
import path from 'path';

const rate: number = config.get<number>('output.rate') || 2000;

@Injectable()
export class BotService implements OnModuleInit {
	/!*	private exportFootballStatisticDebounce: any;
		private exportTableTennisStatisticDebounce: any;
		private exportTennisStatisticDebounce: any;
		private exportBasketballStatisticDebounce: any;*!/
	private supportToken: string;
	private administrators: string[] = [];
	private bot: any;
	private slide = {
		name: '',
		count: 2
	};

	constructor() {
		/!*this.exportFootballStatisticDebounce = throttle(exportFootballStatistic, 20000);
		this.exportTableTennisStatisticDebounce = throttle(exportTableTennisStatistic, 20000);
		this.exportTennisStatisticDebounce = throttle(exportTennisStatistic, 20000);
		this.exportBasketballStatisticDebounce = throttle(exportBasketballStatistic, 20000);*!/

		this.supportToken = process.env.NODE_ENV === 'development'
			? config.get<string>('bots.supportDev.token')
			: config.get<string>('bots.supportProd.token');
		this.administrators = config.get<string[]>('roles.admin');
	}

	/!**
	 * Проверка прав на доступ к меню.
	 *
	 * @param {Object} msg объект что пришел из telegram
	 *!/
	private async accessCheck(msg) {
		const chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
		if (!this.administrators.some((user) => user === chat)) {
			this.stop();
		}
	}

	/!**
	 * Обертка для редактирования сообщения в боте.
	 *
	 * @param {Object} msg объект что пришел из telegram
	 * @param {String} text текст для замены
	 *!/
	private async editMessage(msg, text) {
		const chatId = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
		const opts = {
			chat_id: chatId,
			message_id: msg.message.message_id
		};
		await this.bot.editMessageText(text, opts);
	}
}
*/
