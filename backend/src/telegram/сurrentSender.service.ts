import {Injectable} from '@nestjs/common';
import {ContextTransformer, Context} from 'nest-telegram';

@Injectable()
export class CurrentSender implements ContextTransformer {
	async transform(ctx: Context) {
		const user: any = {};

		return {
			login: user.login,
			isManager: user.isManager,
		};
	}
}