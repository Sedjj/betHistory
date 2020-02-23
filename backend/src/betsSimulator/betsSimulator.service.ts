import {Injectable} from '@nestjs/common';
import {IFootball} from '../football/type/football.type';
import {ConfService} from '../conf/conf.service';

@Injectable()
export class BetsSimulatorService {

	constructor(
		private readonly confService: ConfService,
	) {
	}

	public matchRate(param: IFootball) {
		let typeRate: number = this.confService.getTypeRate(param.strategy);
		const totalRate = param.score.sc1 + param.score.sc2 + typeRate;
		const {
			marketIds,
		} = param;
		switch (param.strategy) {
			case 1 :
				console.log(marketIds, totalRate);
				break;
			case 2 :
				console.log(marketIds, totalRate);
				break;
			case 3 :
				console.log(marketIds, totalRate);
				break;
			default:
				break;
		}
	}
}