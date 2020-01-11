import {Get, Controller, Res, HttpStatus} from '@nestjs/common';
/*import {BotService} from './telegram/bot/bot.service';*/
import {AppService} from './app.service';

@Controller()
export class AppController {
	constructor(
		private readonly appService: AppService,
		/*private botService: BotService*/
	) {
	}

	@Get()
	getHello(): string {
		return this.appService.getHello();
	}

	@Get()
	getBotDialog(@Res() res: any) {
		/*this.botService.botMessage();*/
		res.status(HttpStatus.OK).send('Bot service started');
	}
}