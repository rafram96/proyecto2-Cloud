export interface FilterOptions {
  categories: string[];
  priceRange: {
    min: number;
    max: number;
  };
}