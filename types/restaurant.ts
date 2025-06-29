export interface Restaurant {
  id: string;
  name: string;
  cuisine: string;
  rating: number;
  priceRange: string;
  address: string;
  phone?: string;
  image: string;
  latitude: number;
  longitude: number;
  description: string;
  openHours: string;
  features: string[];
}