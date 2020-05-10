import chrome from 'selenium-webdriver/chrome';
import config from 'config';
import path from 'path';
import {log} from '../../utils/logger';
import {Builder, By, Capabilities, Locator, until, WebDriver, WebElement} from 'selenium-webdriver';
import {saveBufferToFile} from '../../utils/fsHelpers';
import chromeDriver from 'chromedriver';

chrome.setDefaultService(new chrome.ServiceBuilder(chromeDriver.path).build());
const storagePath = config.get<string>('path.storagePath') || process.cwd();
const uploadDirectory = config.get<string>('path.directory.upload') || 'upload';

const speed = {
	veryFast: 500,
	fast: 1000,
	normal: 10000,
	slow: 20 * 1000,
	verySlow: 40 * 1000,
};

/**
 * Создаем инстанс для хрома.
 *
 * @returns {Promise<*>}
 * @constructor
 */
export async function driverChrome(): Promise<WebDriver> {
	try {
		if (process.env.NODE_ENV === 'development') {
			log.info('driverChrome development');
			return await new Builder()
				.withCapabilities(Capabilities.chrome())
				.setChromeOptions(await emulatorOfUniqueness())
				.build();
		} else {
			log.info('driverChrome production');
			// FIXME может тут и не нужен docker chrome раз есть драйвер
			return await new Builder()
				.forBrowser('chrome')
				.setChromeOptions(await emulatorOfUniqueness())
				.usingServer('http://hub:4444/wd/hub')
				.build();
		}
	} catch (e) {
		log.error(`Error driverChrome ->  ${e}`);
		throw new Error('Can`t connect driver');
	}
}

/**
 * Настройки браузера.
 *
 * @param {WebDriver} driver инстанс драйвера
 * @returns {Promise<void>}
 */
export async function init(driver: WebDriver): Promise<void> {
	try {
		await driver.manage().window().setRect({width: 1600, height: 1200});
	} catch (e) {
		throw new Error('Can`t init driver');
	}
}

/**
 * Подмена отпечатка браузера.
 *
 * @returns {Promise<chrome.Options>}
 */
export async function emulatorOfUniqueness(): Promise<chrome.Options> {
	const options = new chrome.Options();
	options.addArguments('headless');
	options.addArguments('no-sandbox');
	options.addArguments('incognito');
	options.addArguments('test-type');
	options.addArguments('disable-webgl');
	options.addArguments('window-size=1600,1200');
	options.addArguments('disable-gpu');
	options.addArguments('disable-webgl-image-chromium');
	return options;
}

/**
 * Функция для поиска элемента по селектору.
 *
 * @param {WebDriver} driver инстанс драйвера
 * @param {Locator} selector
 * @returns {Promise<HTMLInputElement | boolean>}
 */
export async function findSelector(driver: WebDriver, selector: Locator): Promise<boolean | WebElement> {
	try {
		let element: WebElement = await driver.wait(
			until.elementLocated(selector),
			speed.verySlow
		);
		element = await driver.wait(
			until.elementIsVisible(element),
			speed.slow
		);
		if (element) {
			return element;
		} else {
			log.debug(`Item not found in ${speed.verySlow}ms, selector - ${selector}`);
			return false;
		}
	} catch (e) {
		return false;
	}
}

/**
 * Функция для поиска элемента по селектору css.
 *
 * @param {WebDriver} driver инстанс драйвера
 * @param {String} selector css селектор
 * @returns {Promise<boolean>}
 */
export async function findSelectorCss(driver: WebDriver, selector: string): Promise<boolean> {
	try {
		const el = await findSelector(driver, By.css(selector));
		return !!el;
	} catch (e) {
		return false;
	}
}

/**
 * Функция для проверки по css selector, есть ли элемент на странице.
 *
 * @param {WebDriver} driver инстанс драйвера
 * @param {String} selector css селектор
 * @returns {Promise<boolean>}
 */
export async function isElementByCss(driver: WebDriver, selector: string): Promise<boolean> {
	try {
		const el = await driver.findElement(By.css(selector));
		return !!el;
	} catch (e) {
		return false;
	}
}

/**
 * Функция для проверки по id, еслить ли элемент на странице.
 *
 * @param {WebDriver} driver инстанс драйвера
 * @param {String} selector css селектор
 * @returns {Promise<boolean>}
 */
export async function isElementById(driver: WebDriver, selector: string): Promise<boolean> {
	try {
		const el = await driver.findElement(By.id(selector));
		return !!el;
	} catch (e) {
		return false;
	}
}

/**
 * Функция для поиска элемента на странице по id.
 *
 * @param {WebDriver} driver инстанс драйвера
 * @param {String} selector css селектор
 * @returns {Promise<boolean>}
 */
export async function findById(driver: WebDriver, selector: string): Promise<boolean> {
	try {
		const el = await findSelector(driver, By.id(selector));
		return !!el;
	} catch (e) {
		return false;
	}
}

/**
 * Функция для поиска элемента по селектору css и вызова click.
 *
 * @param {WebDriver} driver инстанс драйвера
 * @param {String} selector css селектор
 * @returns {Promise<boolean>}
 */
export async function findCssAndCall(driver: WebDriver, selector: string): Promise<boolean> {
	try {
		const el = await findSelector(driver, By.css(selector));
		if (el && typeof el === 'object') {
			await el.click();
			return true;
		} else {
			return false;
		}
	} catch (e) {
		log.error(`Error findCssAndCall selector - ${selector} -> ${e}`);
		return false;
	}
}

/**
 * Функция для поиска элемента по id и вызова click.
 *
 * @param {WebDriver} driver инстанс драйвера
 * @param {String} selector css селектор
 * @returns {Promise<boolean>}
 */
export async function findIdAndCall(driver: WebDriver, selector: string): Promise<boolean> {
	try {
		const el = await findSelector(driver, By.id(selector));
		if (el && typeof el === 'object') {
			await el.click();
			return true;
		} else {
			return false;
		}
	} catch (e) {
		log.error(`Error findIdAndCall selector - ${selector} -> ${e}`);
		return false;
	}
}

/**
 * Функция для поиска элемента по id и заполнение формы.
 *
 * @param {WebDriver} driver инстанс драйвера
 * @param {String} selector поиска
 * @param {String} text текст заполнения
 * @returns {Promise<boolean>}
 */
export async function findIdAndFill(driver: WebDriver, selector: string, text: string): Promise<boolean> {
	try {
		const el = await findSelector(driver, By.id(selector));
		if (el && typeof el === 'object') {
			await write(el, text);
			return true;
		} else {
			return false;
		}
	} catch (e) {
		log.error(`Error findIdAndFill selector - ${selector} -> ${e}`);
		return false;
	}
}

/**
 * Функция для поиска элемента по селектору css и заполнение формы.
 *
 * @param {WebDriver} driver инстанс драйвера
 * @param {String} selector поиска
 * @param {String} text текст заполнения
 * @returns {Promise<boolean>}
 */
export async function findSelectorCssAndFill(driver: WebDriver, selector: string, text: string): Promise<boolean> {
	try {
		const el = await findSelector(driver, By.css(selector));
		if (el && typeof el === 'object') {
			await write(el, text);
			return true;
		} else {
			return false;
		}
	} catch (e) {
		log.error(`Error findSelectorCssAndFill selector - ${selector} -> ${e}`);
		return false;
	}
}

/**
 * Функция для поиска элемента по содержимому селектора css и вызова click.
 *
 * @param {WebDriver} driver инстанс драйвера
 * @param {String} selector поиска
 * @param {String} value текст заполнения
 * @returns {Promise<boolean>}
 */
export async function findTextBySelectorCssAndCall(driver: WebDriver, selector: string, value: string): Promise<boolean> {
	try {
		const items = await driver.findElements(By.css(selector));
		if (items && items.length > 0) {
			return Promise.resolve(await items.reduce<Promise<boolean>>(async (acc, item) => {
				const text = await item.getText();
				if (text.indexOf(value) !== -1) {
					await item.click();
					acc = Promise.resolve(true);
				}
				return acc;
			}, Promise.resolve(false)));
		} else {
			return false;
		}
	} catch (e) {
		log.error(`Error findTextBySelectorCssAndCall selector - ${selector} -> ${e}`);
		return false;
	}
}

/**
 * Вызов стороннего скрипта.
 *
 * @param {WebDriver} driver инстанс драйвера
 * @param {String} script
 * @returns {Promise<boolean>}
 */
export async function callJS(driver: WebDriver, script: string): Promise<boolean> {
	try {
		await driver.executeScript(script);
		return true;
	} catch (e) {
		log.error(`Error callJS script - ${script} -> ${e}`);
		return false;
	}
}

/**
 * Заполнить элементы ввода
 * @param {WebElement} el элемент дя заполнения
 * @param {String} text текст заполнения
 * @returns {Promise<boolean>}
 */
export async function write(el: WebElement, text: string): Promise<boolean> {
	try {
		const value = await el.getText();
		if (value === '') {
			await el.sendKeys(text);
		}
		return true;
	} catch (e) {
		log.error(`Error write text - ${text} -> ${e}`);
		return false;
	}
}

/**
 * Получение cookies авторизованного пользователя.
 *
 * @param {WebDriver} driver инстанс драйвера
 * @returns {Promise<void>}
 */
export async function getCookies(driver: WebDriver): Promise<void> {
	await driver.manage().getCookies().then((cookies) => {
		log.info(cookies.toString());
	});
}

/**
 * Переключение квладок.
 *
 * @param {WebDriver} driver инстанс драйвера
 * @param {Boolean} closed флаг для определения нужно ли закрыть предыдущую вкладку
 * @returns {Promise<boolean>}
 */
export async function switchTab(driver: WebDriver, closed: boolean = true): Promise<boolean> {
	try {
		const handles = await driver.getAllWindowHandles();
		if (handles.length > 1) {
			// tslint:disable-next-line:no-unused-expression
			closed && await driver.close();
			await driver.switchTo().window(handles[1]);
			await driver.sleep(speed.normal);
			try {
				await driver.wait(
					() => driver.executeScript('return document.readyState')
						.then((readyState) => {
							return readyState === 'complete';
						}),
					speed.verySlow
				);
			} catch (e) {
				log.error('Error document.readyState -> ' + e);
			}
			return true;
		} else {
			return false;
		}
	} catch (e) {
		log.error('Error switchTab -> ' + e);
		return false;
	}
}

/**
 * Создание скриншота выполнения.
 *
 * @param {WebDriver} driver инстанс драйвера
 * @param {String} nameFile имя выходного файла
 * @param {String} title Заголовок для фотки
 * @param {Function} sendPhoto Функция для отправки скриншота в телегу
 * @returns {Promise<boolean>}
 */
export async function screenShot(driver: WebDriver, nameFile: string, title: string, sendPhoto: (file: string, title: string) => Promise<void>): Promise<boolean> {
	try {
		const base64Image = await driver.takeScreenshot();
		const decodedImage: Buffer = Buffer.from(base64Image, 'base64');
		const filePath = await saveBufferToFile(path.join(storagePath, uploadDirectory, nameFile), decodedImage);
		if (process.env.NODE_ENV !== 'development') {
			await sendPhoto(filePath, title);
		}
		await driver.sleep(speed.veryFast);
		return true;
	} catch (e) {
		log.error('Error screenShot -> ' + e);
		return false;
	}
}