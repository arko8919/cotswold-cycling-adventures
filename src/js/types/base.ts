export type AlertType = 'success' | 'error' | 'info' | 'warning';

export interface AlertMessage {
  type: AlertType;
  message: string;
  timeout?: number;
}

export interface Adventure {
  name: string;
  description: string;
  distance: number;
  duration: number;
  maxGroupSize: number;
  difficulty: string;
  price: number;
  priceDiscount: number;
  summary: string;
  startLocation: {
    description: string;
    address: string;
    coordinates: [number, number]; // [lng, lat]
  };
}
