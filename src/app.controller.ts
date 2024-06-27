import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { ImageReaderService } from './image-reader.service';
import { AppService } from './app.service';
import { FoodsResponseDTO, FoodsService, QueryParams } from './foods.service';
import { RegisterService } from './user/register.service';
import { LoginService } from './user/login.service';
import { UserDTO } from './DTOS/UserDTO';

@Controller()
export class AppController {
  constructor(
    private readonly imageReaderservice: ImageReaderService,
    private readonly appService: AppService,
    private readonly foodsService: FoodsService,
    private readonly registerService: RegisterService,
    private readonly loginService: LoginService,
  ) {}

  @Get('healthcheck')
  getHealthcheck(): string {
    return this.appService.getHealthcheck();
  }

  @Get('foods')
  async getFoods(@Query() query: QueryParams): Promise<FoodsResponseDTO> {
    const foods = await this.foodsService.getFoods(query);
    return foods;
  }

  @Post('register')
  async register(@Body() user: UserDTO): Promise<any> {
    return this.registerService.register(user);
  }

  @Post('login')
  async login(@Body() user: UserDTO): Promise<UserDTO> {
    return this.loginService.login(user);
  }

  @Post('read-foods-from-image')
  async readFoodsFromImage(
    @Body() body: { image: string },
  ): Promise<FoodsResponseDTO> {
    const foodsFromGPT = await this.imageReaderservice.readFoodsFromImage(
      body.image,
    );

    const foods: FoodsResponseDTO = {
      foods: [],
      max_results: '',
      page_number: '',
      total_results: '',
    };
    for (const foodFromGPT of foodsFromGPT.foods) {
      const food = await this.foodsService.getFoods({
        page: 1,
        pageSize: 1,
        search: foodFromGPT.name,
      });
      if (food?.foods) foods.foods.push(food.foods[0]);
      else
        foods.foods.push({
          calories: 0,
          food_name: foodFromGPT.name,
          food_description: '',
          food_id: '',
          food_type: '',
          food_url: '',
          brand_name: '',
          fat: 0,
          carbs: 0,
          protein: 0,
          quantity: foodFromGPT.quantity,
          unit: foodFromGPT.unit,
        });
    }
    return foods;
  }
}
