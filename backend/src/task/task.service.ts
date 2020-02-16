import {Injectable, Logger, OnApplicationBootstrap} from '@nestjs/common';
import {Cron} from '@nestjs/schedule';
import {FetchService} from '../fetch/fetch.service';
import config from 'config';
import {ParserFootballService} from '../parser/parserFootball.service';
import {DataAnalysisService} from '../dataAnalysis/dataAnalysis.service';
import {IFootball} from '../football/type/football.type';

const urlFootballSearch = config.get<string>('parser.football.search');
const urlFootballByMarket = config.get<string>('parser.football.byMarket');

@Injectable()
export class TaskService implements OnApplicationBootstrap {
	private readonly logger = new Logger(TaskService.name);

	constructor(
		private fetchService: FetchService,
		private parserFootballService: ParserFootballService,
		private dataAnalysisService: DataAnalysisService,
	) {
	}

	onApplicationBootstrap() {
		this.logger.debug('****start scheduler search football****');
		this.logger.debug('****start scheduler checking results****');
	}

	@Cron((process.env.NODE_ENV === 'development') ? '*/10 * * * * *' : '*/02 * * * *')
	public async searchFootball() {
		try {
			this.logger.debug('Called when the current second is 10');
			let matches = await this.fetchService.searchMatches(urlFootballSearch);
			let matchIds: string[] = this.parserFootballService.getIdList(matches);
			let football = await this.fetchService.getAllMatches(urlFootballByMarket.replace('${id}', matchIds.join()));
			football.forEach((item: any) => {
				try {
					let param: IFootball = this.parserFootballService.getParams(item);
					this.dataAnalysisService.footballLiveStrategy(param);
				} catch (error) {
					this.logger.debug(`Ошибка при парсинге матча: ${JSON.stringify(item)} error: ${error}`);
				}
			});
		} catch (error) {
			this.logger.error(`search: ${error}`);
		}
	}

	@Cron((process.env.NODE_ENV === 'development') ? '*/45 * * * * *' : '00 05 10 * * 0-7')
	public checkingResults() {
		if (process.env.NODE_ENV !== 'development') {
			this.logger.debug('Called when the current second is 45');
		}
	}
}