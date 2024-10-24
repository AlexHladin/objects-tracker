import { MapObject } from '@objects-tracker/types';
import axios, { AxiosInstance, AxiosResponse } from 'axios';

export class MapObjectService {
  api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL,
      timeout: 10000,
    });
  }

  async getObjects(): Promise<AxiosResponse<MapObject[]>> {
    return this.api.get('/objects');
  }

  subscribeToEvents(onMessage: (event: MessageEvent) => void) {
    const eventSource = new EventSource(
      `${import.meta.env.VITE_API_URL}/objects/event`
    );

    eventSource.onmessage = onMessage;
    eventSource.onerror = (error) => {
      console.error('SSE error:', error);

      // closing the connection in case of error
      eventSource.close();
    };
    eventSource.onopen = () => {
      console.log('SSE connection opened');
    };

    return eventSource;
  }
}
