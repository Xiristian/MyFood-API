import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ImageReaderService } from './image-reader.service';
import { AppService } from './app.service';
import { FoodsResponseDTO, FoodsService, QueryParams } from './foods.service';

@Controller()
export class AppController {
  constructor(
    private readonly imageReaderservice: ImageReaderService,
    private readonly appService: AppService,
    private readonly foodsService: FoodsService,
  ) {}

  @Get('healthcheck')
  getHealthcheck(): string {
    return this.appService.getHealthcheck();
  }

  @Get('foods')
  async getFoods(@Query() query: QueryParams): Promise<FoodsResponseDTO> {
    return this.foodsService.getFoods(query);
  }

  @Post('read-foods-from-image')
  async readFoodsFromImage(@Body() body: { image: string }) {
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
    return await this.imageReaderservice.readFoodsFromImage(body.image);
  }
}
