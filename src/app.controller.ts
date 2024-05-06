import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('healthcheck')
  getHealthcheck(): string {
    return this.appService.getHealthcheck();
  }

  @Post('read-foods-from-image')
  async readFoodsFromImage(
    @Body() body: { image: string },
    @Query('is-test') isTest: string,
  ) {
    const foods = [
      {
        name: 'Pizza',
        filling: ['queijo', 'presunto'],
        fillingIdentified: true,
        quantity: 1,
        unit: 'fatia',
      },
      {
        name: 'Macarrão',
        filling: [],
        fillingIdentified: false,
        quantity: 1,
        unit: 'prato',
      },
      {
        name: 'Bolo',
        filling: ['chocolate'],
        fillingIdentified: false,
        quantity: 2,
        unit: 'fatia',
      },
    ];
    if (isTest === 'true')
      return {
        error: null,
        foods,
      };
    return await this.appService.readFoodsFromImage(body.image);
  }
}
