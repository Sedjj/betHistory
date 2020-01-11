import {Injectable} from '@nestjs/common';
import {Context, TelegramActionHandler} from 'nest-telegram';
import {BotOptionsFactory} from './bot/botOptionsFactory';

export type ParseMode = 'Markdown' | 'HTML' ;

@Injectable()
export class HelpActions {
	private readonly option: BotOptionsFactory;

	constructor() {
		this.option = new BotOptionsFactory();
	}

	@TelegramActionHandler({onStart: true})
	async start(ctx: Context) {
		if (!(ctx.update.message && ctx.update.message.text)) {
			return;
		}
		await ctx.replyWithMarkdown('Hi, choose action!', {
			reply_markup: {
				keyboard: this.option.keyboard,
			},
			parse_mode: 'Markdown'
		});
	}

	/*private async menu(msg: Message) {
		const chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from && msg.from.id;
		await this.bot.sendMessage(chat, 'Hi, choose action!', {
			reply_markup: {
				keyboard: this.option.keyboard,
				parse_mode: 'Markdown'
			}
		});
	}*/

	/**
	 * Проверка прав на доступ к меню.
	 *
	 * @param {Object} msg объект что пришел из telegram
	 */
	/*private async accessCheck(msg) {                // ctx.update.message.chat.id
		const chat = msg.hasOwnProperty('chat') ? msg.chat.id : msg.from.id;
		if (!this.administrators.some((user) => user === chat)) {
			this.stop();
		}
	}*/
}