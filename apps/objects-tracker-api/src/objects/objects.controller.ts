import { Controller, Get, Sse } from '@nestjs/common';
import { ObjectsService } from './objects.service';

@Controller('objects')
export class ObjectsController {
  constructor(private readonly objectsService: ObjectsService) {}

  @Get()
  getData() {
    return this.objectsService.getObjects();
  }

  @Sse('event')
  sendEvent() {
    return this.objectsService.sendEvent();
  }
}
