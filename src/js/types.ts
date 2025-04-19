//  Represents a geographic location used to map stop locations
export type Location = {
  type: 'Point';
  coordinates: [Number, Number];
  address: String;
  description: String;
  day: Number;
};
