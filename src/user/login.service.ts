import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { UserDTO } from 'src/DTOS/UserDTO';

@Injectable()
export class LoginService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async login(user: UserDTO) {
    const user_ = await this.cacheManager.get<UserDTO>('user');
    if (!user_) return null;
    if (user.email === user_.email && user.password === user_.password)
      return user_;
  }
}
