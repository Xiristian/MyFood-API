import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ImageReaderService } from './image-reader.service';
import { HttpModule } from '@nestjs/axios';
import { HttpConfigService } from './http-config.service';
import { FoodsService } from './foods.service';

@Module({
  imports: [
    ConfigModule.forRoot(),
    HttpModule.registerAsync({
      useClass: HttpConfigService,
    }),
  ],
  controllers: [AppController],
  providers: [AppService, ImageReaderService, HttpConfigService, FoodsService],
})
export class AppModule {}
