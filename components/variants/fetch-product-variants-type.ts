export interface ProductVariant {
  _id: string;
  attributes?: Attributes;
  instock: boolean;
  name: string;
  price: Price;
  quantity: number;
  slug: string;
  status: string;
  symbol: string;
  unitized?: Unitized;
  id: string;
}

export interface Attributes {
  gender?: string;
  color?: string;
  size?: string;
  brand?: string;
  size_chart?: string;
  fabric?: string;
  color_name?: string;
  material?: string;
  pattern?: string;
  insole?: string;
  sole_material?: string;
  ornamentation?: string;
}

export interface Price {
  currency: string;
  value: number;
  maximum_value?: number;
  offerPercent?: number;
}

export interface Unitized {
  measure: Measure;
}

export interface Measure {
  unit: string;
  value: string;
}
