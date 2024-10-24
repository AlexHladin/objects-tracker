import { Injectable } from '@nestjs/common';

interface GenerateRandomInout {
  min: number;
  max: number;
  precision?: number;
}

@Injectable()
export class RandomService {
  public generateRandom({
    min,
    max,
    precision = 4,
  }: GenerateRandomInout): number {
    return Number((Math.random() * (max - min - 1) + min).toFixed(precision));
  }
}
