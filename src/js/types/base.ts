export type AlertType = 'success' | 'error' | 'info' | 'warning';

export interface AlertMessage {
  type: AlertType;
  message: string;
  timeout?: number;
}

export interface User {
  email: string;
  name: string;
  passwordChangedAt: string;
  photo: string;
  role: string;
  __v: number;
  _id: string;
}

export interface Adventure {
  _id: string;
  __v: number;

  name: string;
  slug: string;
  description: string;
  summary: string;

  difficulty: string;
  duration: number;
  distance: number;
  maxGroupSize: number;

  price: number;
  priceDiscount?: number;

  ratingsAverage: number;
  ratingsQuantity: number;

  secretAdventure: boolean;

  startLocation: {
    description: string;
    address: string;
    coordinates: [number, number];
  };

  guides: Guide[]; // <<<<< Reuse Guide type here
  locations: GeoLocation[]; // <<<<< Reuse GeoLocation type here

  startDates: string[];

  imageCover: string;
  images: string[];
}

export interface Guide {
  email: string;
  name: string;
  photo: string;
  role: 'user' | 'guide' | 'lead-guide' | 'admin';
  _id?: string;
}

export interface GeoLocation {
  type: 'Point';
  coordinates: [number, number];
  address?: string;
  description: string;
  day: number;
  _id?: string;
}
