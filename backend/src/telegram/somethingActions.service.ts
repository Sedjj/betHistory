import {Injectable} from '@nestjs/common';
import {Context} from 'nest-telegram';
import {PipeContext, TelegramActionHandler} from 'nest-telegram/dist';
import {CurrentSender} from './сurrentSender.service';

@Injectable()
export class SomethingActions {
	@TelegramActionHandler({command: '/say'})
	async say(
		ctx: Context,
		// apply this transformer like this
		@PipeContext(CurrentSender) user: any,
	) {
		const {login} = user;

		// now you can use `login`
		await ctx.reply(`Hello, ${login}`);
	}
}