export interface AlimentoDTO {
  nome: string;
  recheio: string[];
  identificouRecheio: boolean;
  quantidade: number;
  unidade: string;
}

export interface AlimentosDTO {
  alimentos: AlimentoDTO[];
}
