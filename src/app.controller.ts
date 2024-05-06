import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('healthcheck')
  getHealthcheck(): string {
    return this.appService.getHealthcheck();
  }

  @Post('read-foods-from-image')
  async readFoodsFromImage(@Body() body: { image: string }) {
    return await this.appService.readFoodsFromImage(body.image);
  }
}
