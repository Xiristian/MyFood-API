import { HttpService } from '@nestjs/axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { UserDTO } from 'src/DTOS/UserDTO';

@Injectable()
export class RegisterService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async register(user: UserDTO) {
    await this.cacheManager.set('user', user);
  }
}
