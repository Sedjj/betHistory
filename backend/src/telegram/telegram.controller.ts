import {Body, Controller, Logger, Post, UploadedFile, UseInterceptors} from '@nestjs/common';
import {TelegramService} from './telegram.service';
import config from 'config';
import {SendMessageDto} from './dto/send-message.dto';
import {FileInterceptor} from '@nestjs/platform-express';
import {SendPhotoDto} from './dto/send-photo.dto';
import {FilePhoto} from './type/telegram.type';

@Controller('telegram')
export class TelegramController {
	private readonly logger = new Logger(TelegramController.name);
	private readonly nameBot: string;

	constructor(private readonly telegramService: TelegramService) {
		if (process.env.NODE_ENV === 'development') {
			this.nameBot = config.get<string>('bots.dev.name');
		} else {
			this.nameBot = config.get<string>('bots.prod.name');
		}
	}

	@Post('sendMessageSupport')
	public sendMessage(@Body() messageDto: SendMessageDto) {
		try {
			this.telegramService.sendMessageSupport(messageDto.text).then(() => {
				this.logger.debug('Send message fine');
			});
		} catch (e) {
			return `Message not send -> ${e}`;
		}
		return 'Message send fine';
	}

	@Post('sendPhoto')
	@UseInterceptors(FileInterceptor('photo'))
	public uploadFilePhoto(@UploadedFile() photo: FilePhoto, @Body() fileDto: SendPhotoDto) {
		try {
			this.telegramService.sendFilePhoto(photo.buffer, fileDto.title || this.nameBot).then(() => {
				this.logger.debug('Send photo fine');
			});
		} catch (e) {
			return `Photo not send -> ${e}`;
		}
		return 'Photo send fine';
	}
}
