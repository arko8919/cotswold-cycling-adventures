//  Represents a geographic location used to map stop locations
export type Location = {
  type: 'Point';
  coordinates: [number, number];
  address: string;
  description: string;
  day: number;
};
