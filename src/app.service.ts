import {
  BlobServiceClient,
  StorageSharedKeyCredential,
} from '@azure/storage-blob';
import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { FoodDTO } from './DTOS/FoodsDTO';
import { AlimentosDTO } from './DTOS/AlimentosDTO';

@Injectable()
export class AppService {
  getHealthcheck(): string {
    return 'OK';
  }

  async saveImage(image64: string) {
    try {
      const data = Buffer.from(image64, 'base64');
      const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
      const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
      const sharedKeyCredential = new StorageSharedKeyCredential(
        accountName,
        accountKey,
      );
      const blobServiceClient = new BlobServiceClient(
        `https://${accountName}.blob.core.windows.net`,
        sharedKeyCredential,
      );
      const containerClient = blobServiceClient.getContainerClient('bronze');
      const blockBlockClient = containerClient.getBlockBlobClient('image.png');
      const uploadBlobResponse = await blockBlockClient.uploadData(data);
      if (uploadBlobResponse._response.status !== 201) {
        console.log(uploadBlobResponse._response);
      }
      return uploadBlobResponse._response.status === 201;
    } catch (error) {
      console.log(error);
      return;
    }
  }

  async sendImageToOpenAI() {
    try {
      const question = `O que há nesta imagem? Por favor, identifique os alimentos presentes na imagem e me envie um JSON com as seguintes informações para cada alimento: {nome: string; recheio: string[]; identificouRecheio: boolean; quantidade: number; unidade: string;}. Nome (ex: pizza, macarrão, bolo), Recheio (Se identificado, caso não, informe recheios comuns para o alimento), Identificou recheio (Caso o recheio tenha sido identificado marque como "true", caso não tenha sido identificado, mas tenha informado possíveis recheios marque "false", caso não tenha sido informado recheios, marque "false"), Quantidade (ex: 1, 1.5, 2), Unidade (ex: fatia, prato, porção, unidade). Exemplo de JSON: {"alimentos": [{"nome": "Pizza",  "recheio": ["queijo", "presunto"], identificouRecheio: true, "quantidade": 1, "unidade": "fatia"}, {"nome": "Macarrão", "recheio": [], identificouRecheio: false, "quantidade": 1, "unidade": "prato"}, {"nome": "Bolo", "recheio": ["chocolate"], identificouRecheio: false, "quantidade": 2, "unidade": "fatia"}]} A resposta deve conter apenas o JSON com as informações sem formatação`;
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
      const image = `https://${accountName}.blob.core.windows.net/bronze/image.png`;
      return await openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: { url: image },
              },
              {
                type: 'text',
                text: question,
              },
            ],
          },
        ],
      });
    } catch (error) {
      console.log(error);
      return;
    }
  }

  async readFoodsFromImage(
    image64: string,
  ): Promise<{ error: string; foods: FoodDTO[] }> {
    if (!(await this.saveImage(image64)))
      return {
        error: 'Erro ao salvar imagem. Por favor, tente novamente.',
        foods: null,
      };
    const response = await this.sendImageToOpenAI();
    if (
      !response ||
      !response.choices ||
      response.choices.length === 0 ||
      !response.choices[0].message.content ||
      response.choices[0].message.content.includes('Sorry')
    )
      return {
        error:
          'Erro ao identificar alimentos na imagem. Por favor, tente novamente.',
        foods: null,
      };

    if (response.choices[0].finish_reason !== 'stop') {
      console.log(response.choices[0]);
      return {
        error:
          'Não foi possível completar a lista de alimentos, tente novamente.',
        foods: null,
      };
    }
    try {
      const content: AlimentosDTO = JSON.parse(
        response.choices[0].message.content,
      );

      if (!content.alimentos)
        return {
          error:
            'Erro ao identificar alimentos na imagem. Por favor, tente novamente.',
          foods: null,
        };

      const foods: FoodDTO[] = content.alimentos.map((food) => {
        return {
          name: food.nome,
          filling: food.recheio,
          fillingIdentified: food.identificouRecheio,
          quantity: food.quantidade,
          unit: food.unidade,
        };
      });
      return { error: null, foods };
    } catch (error) {
      console.log(error);
      return {
        error:
          'Erro ao identificar alimentos na imagem. Por favor, tente novamente.',
        foods: null,
      };
    }
  }
}
