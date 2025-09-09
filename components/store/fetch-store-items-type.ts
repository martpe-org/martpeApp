export interface FetchStoreItemsResponseType {
  total: number;
  results: StoreItem[];
  aggregations?: Aggregations;
}

export interface StoreItem {
  _id: string;
  symbol: string;
  store_status: string;
  rating?: number;
  customizable: boolean;
  type: string;
  unitized?: Unitized;
  location_id: string;
  category_id: string;
  price: Price;
  priceRangeDefault?: number;
  status_timestamp: string;
  slug: string;
  tts_in_h?: number;
  store_id: string;
  images?: string[];
  quantity: number;
  custom_menu_id?: string[];
  diet_type?: string;
  recommended?: boolean;
  provider_status_timestamp: string;
  catalog_id: string;
  store_status_timestamp: string;
  provider_status: string;
  vendor_id: string;
  domain: string;
  name: string;
  provider_id: string;
  short_desc?: string;
  category?: string;
  status: string;
  instock: boolean;
}

export interface Unitized {
  measure: Measure;
}

export interface Measure {
  unit: string;
  value: string;
}

export interface Price {
  currency: string;
  value: number;
  range?: Range;
  default_selection?: DefaultSelection;
  maximum_value?: number;
  offerPercent?: number;
}

export interface Range {
  lower: string;
  upper: string;
}

export interface DefaultSelection {
  value: string;
  maximum_value: string;
}

export interface Aggregations {
  gender: Gender;
  size: Size;
  color: Color;
  fabric: Fabric;
  brand: Brand;
}

export interface Gender {
  doc_count_error_upper_bound: number;
  sum_other_doc_count: number;
  buckets: any[];
}

export interface Size {
  doc_count_error_upper_bound: number;
  sum_other_doc_count: number;
  buckets: any[];
}

export interface Color {
  doc_count_error_upper_bound: number;
  sum_other_doc_count: number;
  buckets: any[];
}

export interface Fabric {
  doc_count_error_upper_bound: number;
  sum_other_doc_count: number;
  buckets: any[];
}

export interface Brand {
  doc_count_error_upper_bound: number;
  sum_other_doc_count: number;
  buckets: any[];
}
