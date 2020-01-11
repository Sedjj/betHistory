import { TelegramErrorHandler, TelegramCatch, Context } from 'nest-telegram';

@TelegramCatch(Error)
export class CustomCatcher
	implements TelegramErrorHandler<Error> {
	public async catch(ctx: Context, exception: Error) {
		await ctx.reply(exception.message) ;
	}
}