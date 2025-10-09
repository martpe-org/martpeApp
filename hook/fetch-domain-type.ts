import { ProductPrice } from "@/components/product/fetch-product-type";
import { Unitized } from "@/components/search/search-products-type";

export interface FetchDomainType {
  offers: HomeOfferType[] | null;
  stores: {
    total: number;
    items: Store2[];
  };
}

export interface HomeOfferType {
  store_id: string;
  images?: any[];
  code: string;
  store_status: string;
  location_ids?: string[];
  rating?: number;
  store: Store;
  gps: Gps;
  offer_id?: string;
  benefit?: Benefit;
  provider_status: string;
  meta?: Meta;
  qualifier?: Qualifier;
  vendor_id: string;
  domain: string;
  item_ids?: any[];
  short_desc: string;
}

export interface Store {
  symbol: string;
  name: string;
  slug: string;
  maxStoreItemOfferPercent?: number;
}

export interface Gps {
  lon: number;
  lat: number;
}

export interface Benefit {
  value_type: string;
  value: string;
  value_cap?: string;
  item_count?: string;
  item_id?: string;
  item_value?: string;
}

export interface Meta {
  auto: string;
  additive: string;
}

export interface Qualifier {
  min_value: string;
}

export interface Store2 {
  symbol: string;
  orderTimings?: OrderTiming[];
  rating?: number;
  store_sub_categories?: string[];
  type: string;
  location_id: string;
  maxStoreItemOfferPercent?: number;
  holidays?: any[];
  avg_tts_in_h: number;
  status_timestamp: string;
  slug: string;
  images: string[];
  address: Address;
  orderDays: number[];
  gps: Gps;
  menu: any[];
  provider_status_timestamp: string;
  itemsAt: number;
  max_tts_in_h: number;
  provider_status: string;
  vendor_id: string;
  domain: string;
  name: string;
  provider_id: string;
  short_desc: string;
  status: string;
  distance_in_km: number;
  offers?: Offer2[];
  order_value?: OrderValue;
  products?: DomainStoreProduct[];
}

export interface DomainStoreProduct {
  _id: string;
  slug: string;
  symbol: string;
  name: string;
  diet_type?: string;
  priceRangeDefault?: number;
  price: ProductPrice;

  ///
  quantity: number;
  domain: string;
  instock: boolean;
  unitized?: Unitized;
  status: string;
  store_id: string;
  catalog_id: string;
  customizable: boolean;
  directlyLinkedCustomGroupIds?: string[];
}

interface OrderTiming {
  day: number;
  time_range: {
    gte: string;
    lte: string;
  };
}

export interface Address {
  city: string;
  street?: string;
  area_code: string;
  locality?: string;
  state: string;
  country?: string;
  name?: string;
  building?: string;
}

export interface Offer2 {
  valid_until?: string;
  qualifier?: Qualifier2;
  valid_from?: string;
  short_desc: string;
  type: string;
  offer_id: string;
}

export interface Qualifier2 {
  min_value: string;
}

export interface OrderValue {
  min_value: string;
}