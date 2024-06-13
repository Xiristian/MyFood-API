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
  ) { }

  @Get('healthcheck')
  getHealthcheck(): string {
    return this.appService.getHealthcheck();
  }

  @Get('foods')
  async getFoods(@Query() query: QueryParams): Promise<FoodsResponseDTO> {
    return this.foodsService.getFoods(query);
  }

  @Post('register')
  async register(@Query() user: UserDTO): Promise<any> {
    return this.registerService.register(user);
  }

  @Post('login')
  async login(@Query() user: UserDTO): Promise<UserDTO> {
    return this.loginService.login(user);
  }

  @Post('read-foods-from-image')
  async readFoodsFromImage(@Body() body: { image: string }) {
    return await this.imageReaderservice.readFoodsFromImage(body.image);
  }
}
