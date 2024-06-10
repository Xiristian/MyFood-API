import { HttpModuleOptions, HttpModuleOptionsFactory } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class HttpConfigService implements HttpModuleOptionsFactory {
  private readonly tokenUrl = 'https://oauth.fatsecret.com/connect/token';
  private readonly clientId = process.env.FATSECRET_CLIENT_ID;
  private readonly clientSecret = process.env.FATSECRET_CLIENT_SECRET;

  private accessToken: string;
  private tokenExpiry: number;

  async createHttpOptions(): Promise<HttpModuleOptions> {
    return {
      baseURL: 'https://platform.fatsecret.com/rest/server.api',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${await this.getValidToken()}`,
      },
    };
  }

  private async getValidToken(): Promise<string> {
    if (!this.accessToken || this.isTokenExpired()) {
      await this.refreshToken();
    }
    return this.accessToken;
  }

  private isTokenExpired(): boolean {
    return !this.tokenExpiry || Date.now() >= this.tokenExpiry;
  }

  private async refreshToken(): Promise<void> {
    try {
      const response = await axios.post(
        this.tokenUrl,
        new URLSearchParams({
          grant_type: 'client_credentials',
          client_id: this.clientId,
          client_secret: this.clientSecret,
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + response.data.expires_in * 1000 - 60000;
      console.log(response.data.expires_in, new Date(this.tokenExpiry));
    } catch (error) {
      throw new Error('Could not fetch bearer token');
    }
  }
}
