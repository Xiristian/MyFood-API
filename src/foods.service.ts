import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

export interface QueryParams {
  search: string;
  page: number;
  pageSize: number;
}

interface FoodDTO {
  brand_name: string;
  food_description: string;
  food_id: string;
  food_name: string;
  food_type: string;
  food_url: string;
}

interface FoodsDTO {
  foods: {
    food: FoodResponseDTO[];
    max_results: string;
    page_number: string;
    total_results: string;
  };
}

interface FoodResponseDTO extends FoodDTO {
  quantity: number;
  unit: string;
  calories: number;
  fat: number;
  carbs: number;
  protein: number;
}

export interface FoodsResponseDTO {
  foods: FoodResponseDTO[];
  max_results: string;
  page_number: string;
  total_results: string;
}

@Injectable()
export class FoodsService {
  constructor(private readonly httpService: HttpService) {}

  async getFoods(query: QueryParams): Promise<FoodsResponseDTO | any> {
    try {
      const { data }: { data: FoodsDTO } = await firstValueFrom(
        this.httpService.get(
          `?method=foods.search&search_expression=${query.search}&format=json&page_number=${query.page}&max_results=${query.pageSize}`,
        ),
      );

      if (!data?.foods?.total_results) throw new Error(JSON.stringify(data));
      if (parseInt(data.foods.total_results) === 0) {
        throw new Error(
          'Não foram encontrados alimentos com o nome informado.' +
            JSON.stringify(data),
        );
      }
      const foods: FoodResponseDTO[] = [];
      if (!Array.isArray(data.foods.food)) {
        data.foods.food = [data.foods.food] as any;
      }
      for (const food of data.foods.food) {
        if (!food) continue;
        const foo = food.food_description.match(
          /Per (\d+\/\d+|\d+) ?([a-zA-Z]+)/,
        );
        const quantity = foo?.[1];
        const unit = foo?.[2];
        const calories = food.food_description.match(/Calories: (\d+)/)?.[1];
        const fat = food.food_description.match(/Fat: (\d+\.\d+)/)?.[1];
        const carbs = food.food_description.match(/Carbs: (\d+\.\d+)/)?.[1];
        const protein = food.food_description.match(/Protein: (\d+\.\d+)/)?.[1];
        foods.push({
          ...food,
          quantity: quantity ? eval(quantity) : 1,
          unit: unit || 'g',
          calories: calories ? parseFloat(calories) : 0,
          fat: fat ? parseFloat(fat) : 0,
          carbs: carbs ? parseFloat(carbs) : 0,
          protein: protein ? parseFloat(protein) : 0,
        });
      }
      const response: FoodsResponseDTO = {
        foods,
        max_results: data.foods.max_results,
        page_number: data.foods.page_number,
        total_results: data.foods.total_results,
      };
      return response;
    } catch (error) {
      return 'Não foi possível buscar os alimentos. ' + error;
      throw new Error('Não foi possível buscar os alimentos. ' + error);
    }
  }
}
