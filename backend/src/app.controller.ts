import {Controller, Get, HttpStatus, Res} from '@nestjs/common';
import {AppService} from './app.service';

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get()
	getCheckApi(): string {
		return this.appService.getCheckApi();
	}

	@Get()
	getBotDialog(@Res() res: any) {
		res.status(HttpStatus.OK).send('Bot service started!');
	}
}
