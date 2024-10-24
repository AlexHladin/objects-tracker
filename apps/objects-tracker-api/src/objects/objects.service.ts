import { Injectable, Logger } from '@nestjs/common';
import { filter, interval, map, merge, Observable, Subject, tap } from 'rxjs';
import {
  Action,
  EUROPE_BOUNDS,
  MapObject,
  ObjectCreateEvent,
  ObjectDeleteEvent,
  ObjectUpdateEvent,
} from '@objects-tracker/types';
import { RandomService } from './random.service';

const MIN_OBJECTS_COUNT = 100;
const MAX_OBJECTS_COUNT = 200;

@Injectable()
export class ObjectsService {
  private static id = 1;

  private readonly logger = new Logger(ObjectsService.name);

  private addSubject = new Subject<MapObject>();
  private updateSubject = new Subject<number>();
  private removeSubject = new Subject<Pick<MapObject, 'id'>>();

  private actions = new Subject<{
    data: ObjectCreateEvent | ObjectUpdateEvent | ObjectDeleteEvent;
  }>();

  private objects: MapObject[] = [];
  private simulatedWorld$: Observable<{
    data: ObjectCreateEvent | ObjectUpdateEvent | ObjectDeleteEvent;
  }>;

  constructor(private randomService: RandomService) {
    const actionsLength = Object.values(Action).filter(
      (value) => typeof value === 'string'
    ).length;
    // generate initial array of objects
    const objectsCount = this.randomService.generateRandom({
      min: MIN_OBJECTS_COUNT,
      max: MAX_OBJECTS_COUNT,
      precision: 0,
    });

    for (let i = 0; i < objectsCount; i++) {
      this.objects.push(this.createMapObject());
    }

    this.simulatedWorld$ = merge(
      this.addSubject.pipe(
        tap((mapObject) => this.objects.push(mapObject)),
        map(
          (payload) =>
            ({ type: Action.ADD, data: payload } as ObjectCreateEvent)
        )
      ),
      this.updateSubject.pipe(
        map((id) => this.objects.find((object) => object.id === id)),
        filter(Boolean),
        map((objectToUpdate) => {
          this.updateObject(objectToUpdate);

          return objectToUpdate;
        }),
        map(
          (payload) =>
            ({ type: Action.UPDATE, data: payload } as ObjectUpdateEvent)
        )
      ),
      this.removeSubject.pipe(
        tap(({ id }) => {
          const objectIndex = this.objects.findIndex(
            (object) => object.id === id
          );

          this.objects.splice(objectIndex, 1);
        }),
        map(
          (payload) =>
            ({
              type: Action.REMOVE,
              data: { id: payload.id },
            } as ObjectDeleteEvent)
        )
      )
    ).pipe(
      map((event) => ({ data: event })),
      tap((event) => {
        this.actions.next(event);

        this.logger.log(
          `Simulated world received new event: ${JSON.stringify(event)}`
        );
      })
    );

    // generate random actions for random objects
    merge(
      interval(1000).pipe(
        map(() =>
          this.randomService.generateRandom({
            min: 0,
            max: actionsLength,
            precision: 0,
          })
        )
      ),
      // additionally update random object every 200ms
      interval(200).pipe(map(() => Action.UPDATE))
    ).subscribe((action) => {
      const randomObjectIndex = this.randomService.generateRandom({
        min: 0,
        max: this.objects.length,
        precision: 0,
      });

      if (!this.objects[randomObjectIndex]) {
        return;
      }

      switch (action) {
        case Action.ADD:
          this.addSubject.next(this.createMapObject());
          break;
        case Action.UPDATE:
          this.updateSubject.next(this.objects[randomObjectIndex].id);
          break;
        case Action.REMOVE:
          this.removeSubject.next(this.objects[randomObjectIndex]);
          break;
      }
    });

    this.simulatedWorld$.subscribe();
  }

  private updateObject(object: MapObject | undefined) {
    object.position = {
      lat: object.position.lat + object.velocity * object.direction.y,
      lng: object.position.lng + object.velocity * object.direction.x,
    };
  }

  getObjects(): MapObject[] {
    return this.objects;
  }

  sendEvent(): typeof this.simulatedWorld$ {
    return this.actions.asObservable();
  }

  private createMapObject(): MapObject {
    return {
      id: ObjectsService.id++,
      velocity: this.randomService.generateRandom({ min: 0.1, max: 1 }),
      position: {
        lat: this.randomService.generateRandom({
          min: EUROPE_BOUNDS.LAT_MIN,
          max: EUROPE_BOUNDS.LAT_MAX,
        }),
        lng: this.randomService.generateRandom({
          min: EUROPE_BOUNDS.LNG_MIN,
          max: EUROPE_BOUNDS.LNG_MAX,
        }),
      },
      direction: {
        x: this.randomService.generateRandom({ min: -1, max: 1 }),
        y: this.randomService.generateRandom({ min: -1, max: 1 }),
      },
    };
  }
}
