import { Action, MapObjectStatus } from '@objects-tracker/types';
import { makeAutoObservable, runInAction } from 'mobx';
import { MapObjectService } from '../services/map-objects-service';
import { MapObjectStore } from './map-object-store';
import { FIVE_MINUTES, MINUTE } from '../contants/time';

interface EventHandler {
  onOpenConnection: (message: string) => void;
  onError: (error: string) => void;
}

class MapObjectsStore {
  public objects: MapObjectStore[] = [];

  private mapObjectsService: MapObjectService;
  private eventSource: EventSource | null = null;

  onRemoveObjectCallback: ((id: number) => void) | null = null;

  constructor() {
    this.mapObjectsService = new MapObjectService();

    makeAutoObservable(this);

    this.startCleanupInterval();
  }

  private startCleanupInterval() {
    setInterval(() => {
      console.log('Running cleanup interval');

      const objectsToRemove: number[] = [];
      for (const mapObject of this.objects) {
        if (mapObject.status !== MapObjectStatus.LOST) {
          continue;
        }

        if (
          mapObject.lostDetectionTime &&
          Date.now() - mapObject.lostDetectionTime > FIVE_MINUTES
        ) {
          objectsToRemove.push(mapObject.id);
        }
      }

      console.log('Objects to remove', objectsToRemove);
      runInAction(() => {
        this.objects = this.objects.filter(
          (obj) => !objectsToRemove.includes(obj.id)
        );
      });

      objectsToRemove.forEach((id) => {
        if (this.onRemoveObjectCallback) {
          this.onRemoveObjectCallback(id);
        }
      });
    }, MINUTE);
  }

  public async initializeObjects() {
    try {
      const objects = await this.mapObjectsService.getObjects();

      runInAction(() => {
        this.objects = objects.data.map((obj) => new MapObjectStore(obj));
      });
    } catch (error) {
      console.error('Error fetching objects: ', error);
      throw error;
    }
  }

  subscribeToEvents(eventHandler: Partial<EventHandler> = {}) {
    if (this.eventSource) {
      return;
    }

    const onMessage = (event: MessageEvent) => {
      const eventData = JSON.parse(event.data);

      runInAction(() => {
        switch (eventData.type) {
          case Action.ADD: {
            const newObject = new MapObjectStore(eventData.data);
            this.objects.push(newObject);

            break;
          }
          case Action.UPDATE: {
            const targetObject = this.objects.find(
              (obj) => obj.id === eventData.data.id
            );

            if (targetObject) {
              targetObject.updatePosition(eventData.data.position);
            } else {
              this.objects.push(new MapObjectStore(eventData.data));
            }

            break;
          }
          case Action.REMOVE: {
            this.objects = this.objects.filter(
              (obj) => obj.id !== eventData.id
            );
            break;
          }
          default:
            break;
        }
      });
    };
    const onOpenConnection = () => {
      if (eventHandler.onOpenConnection) {
        eventHandler.onOpenConnection('Connection established');
      }
    };
    const onError = (error: Event) => {
      if (eventHandler.onError) {
        eventHandler.onError('Connection lost. Trying to reconnect...');
      }
    };

    this.eventSource = this.mapObjectsService.subscribeToEvents(onMessage);
    this.eventSource.onopen = onOpenConnection;
    this.eventSource.onerror = onError;
  }

  closeSSEConnection() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
  }

  set onRemoveObject(callback: (id: number) => void) {
    this.onRemoveObjectCallback = callback;

    this.objects.forEach((obj) => {
      obj.onRemoveObject = callback;
    });
  }
}

export const mapObjectsStore = new MapObjectsStore();
