import {BetAmount} from './betAmount';
import {RateStatus} from './rateStatus';
import {ExportStatus} from './exportStatus';
import {ErrorsStack} from './errorsStack';

let betAmount: BetAmount = new BetAmount();
let rateStatus: RateStatus = new RateStatus();
let exportStatus: ExportStatus = new ExportStatus();
let errorsStack: ErrorsStack = new ErrorsStack();

export {betAmount, rateStatus, exportStatus, errorsStack};
