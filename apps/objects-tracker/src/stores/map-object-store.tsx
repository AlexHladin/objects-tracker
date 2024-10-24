import { runInAction, makeAutoObservable } from 'mobx';
import {
  MapObject,
  MapObjectStatus,
  Position,
  Vector,
} from '@objects-tracker/types';
import { MINUTE } from '../contants/time';

export class MapObjectStore {
  id: number;
  position: Position;
  velocity: number;
  direction: Vector;

  status: MapObjectStatus;
  lostDetectionTime: number | null = null;

  private lostTimeout: NodeJS.Timeout | null = null;

  private onRemoveObjectCallback: ((id: number) => void) | null = null;

  constructor(mapObject: MapObject) {
    this.id = mapObject.id;
    this.position = mapObject.position;
    this.velocity = mapObject.velocity;
    this.direction = mapObject.direction;

    this.status = MapObjectStatus.ACTIVE;

    makeAutoObservable(this);

    this.startInterval();
  }

  private startInterval() {
    this.lostTimeout = setTimeout(() => {
      this.status = MapObjectStatus.LOST;
      this.lostDetectionTime = Date.now();
    }, MINUTE);
  }

  private refreshLostInterval() {
    if (this.lostTimeout) {
      clearTimeout(this.lostTimeout);
      this.startInterval();
    }
  }

  updatePosition(newPosition: Position) {
    runInAction(() => {
      this.position = newPosition;

      this.refreshLostInterval();
    });
  }

  updateVelocity(newVelocity: number) {
    runInAction(() => {
      this.velocity = newVelocity;

      this.refreshLostInterval();
    });
  }

  updateDirection(newDirection: Vector) {
    runInAction(() => {
      this.direction = newDirection;

      this.refreshLostInterval();
    });
  }

  updateMapObject(mapObject: MapObject) {
    runInAction(() => {
      this.position = mapObject.position;
      this.velocity = mapObject.velocity;
      this.direction = mapObject.direction;

      this.refreshLostInterval();
    });
  }

  set onRemoveObject(callback: (id: number) => void) {
    this.onRemoveObjectCallback = callback;
  }
}
