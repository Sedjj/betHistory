import {Get, Controller, Res, HttpStatus} from '@nestjs/common';
import {AppService} from './app.service';

@Controller()
export class AppController {
	constructor(
		private readonly appService: AppService,
	) {
	}

	@Get()
	getHello(): string {
		return this.appService.getHello();
	}

	@Get()
	getBotDialog(@Res() res: any) {
		res.status(HttpStatus.OK).send('Bot service started');
	}
}