export interface MapObject {
  id: number;
  velocity: number;
  position: Position;
  direction: Vector;
  status?: MapObjectStatus;
}

export enum MapObjectStatus {
  ACTIVE,
  LOST,
}

export interface Position {
  lat: number;
  lng: number;
}

export interface Vector {
  x: number;
  y: number;
}
