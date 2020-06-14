import {BetAmount} from './betAmount';
import {RateStatus} from './rateStatus';
import {AuthPhone} from './authPhone';
import {ExportStatus} from './exportStatus';

let rateAmount: BetAmount = new BetAmount();
let rateStatus: RateStatus = new RateStatus();
let authPhone: AuthPhone = new AuthPhone();
let exportStatus: ExportStatus = new ExportStatus();

export {
	rateAmount,
	rateStatus,
	authPhone,
	exportStatus,
};