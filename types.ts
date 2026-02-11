
export enum ConstructionType {
  BASIC = 'BASIC',
  STANDARD = 'STANDARD',
  PREMIUM = 'PREMIUM'
}

export enum CityType {
  TIER_1 = 'TIER_1',
  TIER_2 = 'TIER_2',
  TIER_3 = 'TIER_3'
}

export interface CalculationResult {
  baseCost: number;
  cityAdjustedCost: number;
  materialAdjustment: number;
  subtotal: number;
  contingency: number;
  finalTotal: number;
  costPerSqFt: number;
}

export const ConstructionRates: Record<ConstructionType, number> = {
  [ConstructionType.BASIC]: 1500,
  [ConstructionType.STANDARD]: 2000,
  [ConstructionType.PREMIUM]: 2800,
};

export const CityMultipliers: Record<CityType, number> = {
  [CityType.TIER_1]: 1.2,
  [CityType.TIER_2]: 1.0,
  [CityType.TIER_3]: 0.85,
};
