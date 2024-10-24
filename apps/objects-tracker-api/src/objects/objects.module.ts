import { Module } from '@nestjs/common';
import { ObjectsController } from './objects.controller';
import { ObjectsService } from './objects.service';
import { RandomService } from './random.service';

@Module({
  imports: [],
  controllers: [ObjectsController],
  providers: [ObjectsService, RandomService],
})
export class ObjectsModule {}
