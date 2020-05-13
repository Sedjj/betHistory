import config from 'config';
import {rateAmount, rateStatus} from '../../store';
import {Injectable, Logger, OnApplicationBootstrap} from '@nestjs/common';
import {Auth, LayOrBack, Speed} from './type/selenium.type';
import {
	driverChrome, findById,
	findCssAndCall,
	findIdAndCall,
	findIdAndFill,
	findSelectorCss,
	findSelectorCssAndFill,
	init,
	isElementByCss,
	screenShot
} from './seleniumApi';
import {WebDriver} from 'selenium-webdriver';
import {TelegramService} from '../../telegram/telegram.service';

@Injectable()
export class SeleniumBotService implements OnApplicationBootstrap {
	private readonly logger = new Logger(SeleniumBotService.name);
	/**
	 * Массив интервалов в миллисекундах после которых делается попытка снова
	 */
	private readonly searchTimeouts: number[] = [2000, 5000, 8000, 12000, 1];
	private speed: Speed = {
		veryFast: 500,
		fast: 1000,
		normal: 10000,
		slow: 20 * 1000,
		verySlow: 40 * 1000,
		waitingForCode: 120 * 1000,
	};
	private auth: Auth;
	private readonly nameBot: string;
	private readonly urlStartPage: string;

	constructor(
		private readonly telegramService: TelegramService
	) {
		this.auth = config.get<Auth>('auth');
		if (process.env.NODE_ENV === 'development') {
			this.nameBot = config.get<string>('bots.dev.name');
		} else {
			this.nameBot = config.get<string>('bots.prod.name');
		}
		this.urlStartPage = config.get<string>('parser.startPage');
	}

	async onApplicationBootstrap() {
		await this.performEmulation('1.23123', 'lay', 1);
	}

	/**
	 * Эмулмирует работу на PC.
	 *
	 * @param {String} marketId идентификатор матча
	 * @param {LayOrBack} layOrBack флаг за или против
	 * @param {Number} price коэффициент ставки
	 * @returns {Promise<void>}
	 */
	async performEmulation(marketId: string, layOrBack: LayOrBack, price: number) {
		if (!rateStatus.status) {
			return;
		}
		/*	{
				"marketId": "1.170380271",
				"marketType": "FIRST_HALF_GOALS_05"
			},*/
		let driver: WebDriver | null = null;
		try {
			this.logger.debug(`Rate match ${marketId} with '${price}'`);
			driver = await driverChrome();
			await init(driver);
			await driver.get(this.urlStartPage.replace('${marketId}', marketId));
			if (await this.authorization(driver)) {
				this.logger.debug('Authorization successfully');
				for (const timeoutOne of this.searchTimeouts) {
					for (const timeoutTwo of this.searchTimeouts) {
						if (await this.searchRate(driver, layOrBack, price)) {
							break;
						}
						this.logger.debug(`Search rate sleep on ${timeoutTwo}ms`);
						await driver.sleep(timeoutTwo);
					}
					this.logger.debug(`Search did not find match or close promo modal - sleep on ${timeoutOne}ms`);
					await driver.sleep(timeoutOne);
				}
			}
			await screenShot(driver, `${(new Date()).getTime()}.png`, this.nameBot, this.sendPhoto);
			await driver.sleep(this.speed.fast);
			await driver.quit();
		} catch (e) {
			this.logger.error(`Error performEmulation ->  ${JSON.stringify(e)}`);
			if (driver) {
				await screenShot(driver, `${(new Date()).getTime()}.png`, this.nameBot, this.sendPhoto);
				await driver.sleep(this.speed.fast);
				await driver.quit();
			}
		}
	}

	/**
	 * Метод для авторизации пользователя.
	 *
	 * @param {WebDriver} driver инстанс драйвера
	 * @returns {Promise<boolean>}
	 */
	private async authorization(driver: WebDriver): Promise<boolean> {
		await driver.sleep(this.speed.fast);
		if (!await findById(driver, 'ssc-lif')) {
			if (await findSelectorCss(driver, '.ssc-lof')) {
				return true;
			}
		} else {
			await findIdAndFill(driver, 'ssc-liu', this.auth.login);
			await findIdAndFill(driver, 'ssc-lipw', this.auth.password);
			if (await findIdAndCall(driver, 'ssc-lis')) {
				await driver.sleep(this.speed.fast);
				await this.waitLoadPage(driver);
				return true;
			}
		}
		await this.sendNotification('Authorization failed');
		return false;
	}

	/**
	 * Метод для поиска нужного коэфициента для ставки.
	 *
	 * @param {WebDriver} driver инстанс драйвера
	 * @param {LayOrBack} layOrBack флаг за или против
	 * @param {Number} price коэффициент ставки
	 * @returns {Promise<boolean>}
	 */
	private async searchRate(driver: WebDriver, layOrBack: LayOrBack, price: number) {
		if (
			await findSelectorCss(driver, `.${layOrBack}-selection-button`)
			&& await findSelectorCss(driver, '.ssc-lof')
		) {
			if (!await isElementByCss(driver, `.${layOrBack}-selection-button[price="${price}"]`)) {
				try {
					if (await findCssAndCall(driver, `.${layOrBack}-selection-button[price="${price}"]`)) {
						return await this.rate(driver, layOrBack);
					} else {
						await this.sendNotification('Current rate not found');
						return false;
					}
				} catch (e) {
					await this.sendNotification(`Rate locked on current match: ${JSON.stringify(e)}`);
					return false;
				}
			}
			await this.sendNotification(`Rate ${price} locked on current match`);
		} else {
			await this.sendNotification('Search rate on match failed');
		}
		return false;
	}

	/**
	 * Ставка выбраного коэфициента.
	 *
	 * @param {WebDriver} driver инстанс драйвера
	 * @param {LayOrBack} layOrBack флаг за или против
	 * @returns {Promise<boolean>}
	 */
	private async rate(driver: WebDriver, layOrBack: LayOrBack) {
		if (await findSelectorCssAndFill(driver, `.betslip__editable-bet--${layOrBack} .betslip-size-input`, rateAmount.bets.toString())) {
			this.logger.debug(`bet_sum_input ${rateAmount.bets}`);
			await findCssAndCall(driver, '.potentials-footer__action[highlighted="true"]');
			if (await findSelectorCss(driver, '.bets-state-header > .inplay-options')) {
				await this.sendNotification('Bet warning');
				return true;
			}
			this.logger.debug('Rate successfully');
			return true;
		}
		await this.sendNotification('Rate failed');
		return false;
	}

	/**
	 * Метод для логирования обработанных ошибок в чат и лог файл.
	 *
	 * @param {String} text текст ошибки
	 */
	private async sendNotification(text: string): Promise<void> {
		this.logger.debug(text);
		await this.telegramService.sendMessageSupport(`<pre>${text}</pre>`);
	}

	/**
	 * Метод для отправки скриншотов в чат support из телеграмм бота..
	 *
	 * @param {ReadStream} file для отправки в чат
	 * @param {String} title Заголовок для фотки
	 */
	private async sendPhoto(file: string, title: string): Promise<void> {
		this.logger.debug(title);
		await this.telegramService.sendPhoto(file, title);
	}

	/**
	 * Метод для проверки что страница загрузилась
	 *
	 * @param {WebDriver} driver инстанс драйвера
	 * @returns {Promise<boolean>}
	 */
	private async waitLoadPage(driver: WebDriver): Promise<boolean> {
		try {
			await driver.sleep(this.speed.normal);
			return await driver.wait(
				() => driver.executeScript('return document.readyState')
					.then((readyState) => {
						return readyState === 'complete';
					}),
				this.speed.verySlow
			);
		} catch (e) {
			this.logger.error('Error document.readyState -> ' + e);
			return false;
		}
	}
}
