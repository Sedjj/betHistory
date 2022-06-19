import { Module } from "@nestjs/common";
import { ConfService } from "./conf.service";
import { MongooseModule } from "@nestjs/mongoose";
import { Config, ConfigSchema } from "./schemas/config.schema";
import { ConfController } from "./conf.controller";
import { LoggerModule } from "../../logger/logger.module";

@Module({
	imports: [
		LoggerModule,
		MongooseModule.forFeature([
			{
				name: Config.name,
				schema: ConfigSchema
			}
		])
	],
	controllers: [ConfController],
	providers: [ConfService],
	exports: [ConfService],
})
export class ConfModule {}
