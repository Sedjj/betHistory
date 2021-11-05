import {IExcludeGroupRate} from '../type/filters.type';

export class CreateFiltersDto {
	public readonly groups: IExcludeGroupRate[];

	constructor() {
		this.groups = [
			{
				name: 'Austrian Bundesliga',
				enable: 1,
			},
			{
				name: 'Canadian',
				enable: 1,
			},
		];
	}
}
