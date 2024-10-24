import { Action } from './actions';
import { MapObject } from './objects';

export interface ObjectEvent<T> {
  type: Action;
  data: T;
}

export type ObjectCreateEvent = ObjectEvent<MapObject>;
export type ObjectUpdateEvent = ObjectEvent<MapObject>;
export type ObjectDeleteEvent = ObjectEvent<Pick<MapObject, 'id'>>;
