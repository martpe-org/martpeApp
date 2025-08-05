export interface FetchProductDetail {
  _id: string;
  catalog_id: string;
  category: string;
  category_id: string;
  createdAt: string;
  parent_item_id?: string;
  variants?: string[];
  attributes?: Attributes;
  custom_menu_id?: string[];
  back_image?: string;
  customizable: boolean;
  diet_type?: string;
  directlyLinkedCustomGroupIds?: string[];
  domain: string;
  gps: Gps;
  images?: string[];
  instock: boolean;
  location_id: string;
  long_desc?: string;
  meta?: Meta;
  name: string;
  price: Price;
  priceRangeDefault?: number;
  provider_id: string;
  provider_status: string;
  provider_status_timestamp: string;
  quantity: number;
  rating?: number;
  recommended?: boolean;
  short_desc?: string;
  slug: string;
  status: string;
  status_timestamp: string;
  store: Store;
  store_id: string;
  store_status: string;
  store_status_timestamp: string;
  symbol: string;
  tts_in_h?: number;
  type: string;
  unitized?: Unitized;
  updatedAt: string;
  vendor_id: string;
  // lookup
  customizations?: any;
  offers?: Offer[];
}

export interface Attributes {
  brand?: string;
  model?: string;
  color?: string;
  ram?: string;
  rom?: string;
  size?: string;
  color_name?: string;
  ram_unit?: string;
  storage_unit?: string;
  special_feature?: string;
  includes?: string;
  weight?: string;
}

export interface Gps {
  lat: number;
  lon: number;
}

export interface Meta {
  returnable: boolean;
  cancellable: boolean;
  return_window?: string;
  seller_pickup_return?: boolean;
  time_to_ship?: string;
  available_on_cod: boolean;
  contact_details_consumer_care?: string;
  fssai_license_no?: string;
  mandatory_reqs_veggies_fruits?: any;
  statutory_reqs_packaged_commodities?: any;
  statutory_reqs_prepackaged_food?: any;
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

export interface Store {
  name: string;
  symbol: string;
  address: Address;
  rating?: number;
  slug: string;
}

export interface Address {
  city: string;
  state: string;
  locality?: string;
  area_code: string;
  street?: string;
}

export interface Unitized {
  measure?: Measure;
}

export interface Measure {
  unit?: string;
  value?: string;
}

export interface Offer {
  _id: string;
  benefit?: Benefit;
  code: string;
  createdAt: string;
  domain: string;
  gps: Gps2;
  images?: any[];
  isHyperLocalOnly: boolean;
  isPanindia: boolean;
  item_ids?: any[];
  location_ids?: string[];
  maxRadius: number;
  meta?: Meta2;
  offer_id?: string;
  provider_status: string;
  qualifier?: Qualifier;
  rating?: number;
  short_desc: string;
  store: Store2;
  store_id: string;
  store_status: string;
  updatedAt: string;
  vendor_id: string;
}

export interface Benefit {
  value_type?: string;
  value?: string;
}

export interface Gps2 {
  lat: number;
  lon: number;
}

export interface Meta2 {
  additive?: string;
  auto?: string;
}

export interface Qualifier {
  min_value?: string;
}

export interface Store2 {
  name: string;
  symbol: string;
  slug: string;
}
