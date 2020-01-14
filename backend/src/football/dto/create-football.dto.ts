import {ICardsCommands, ICommand, IScore, ITimeSnapshot} from '../interfaces/football.interface';

export class CreateFootballDto {
	public readonly matchId: number;
	public readonly strategy: number;
	public readonly time: number[];
	public readonly score: IScore;
	public readonly command: ICommand;
	public readonly rates: ITimeSnapshot;
	public readonly cards: ICardsCommands;

	constructor() {
		console.log('');
	}
}