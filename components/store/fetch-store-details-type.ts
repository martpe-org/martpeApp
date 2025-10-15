export interface FetchStoreDetailsResponseType {
  _id: string;
  address: Address;
  store_sub_categories?: string[];
  avg_tts_in_h: number;
  custom_menus?: CustomMenu[];
  domain: string;
  fssai_license_no?: string;
  fulfillments?: Fulfillment[];
  gps: Gps;
  holidays?: string[];
  images: string[];
  isHyperLocalOnly: boolean;
  isPanindia: boolean;
  itemsAt?: number;
  location_id: string;
  long_desc?: string;
  maxRadius: number;
  maxStoreItemOfferPercent?: number;
  max_tts_in_h?: number;
  menu?: string[];
  name: string;
  orderDays?: number[];
  orderTimings?: OrderTiming[];
  provider_id: string;
  provider_status: string;
  provider_status_timestamp: string;
  rating?: number;
  short_desc?: string;
  slug: string;
  status: string;
  status_timestamp: string;
  store_categories?: string[];
  symbol: string;
  type: string;
  updatedAt: string;
  vendor_id: string;
  offers?: any[];
  consumer_care?: {
    contact_name: string;
    contact_number: string;
    contact_email: string;
  };
  
  // Add these missing fields from the API response
  createdAt?: string;
  filename?: string;
  geometry?: {
    coordinates: number[][][];
    type: string;
  };
  isSingleNonPanindiaServicebility?: boolean;
  order_value?: {
    min_value: number;
  };
  time_range?: {
    gte: string;
    lte: string;
  };
  creds?: any[]; // Add this if needed
}

export interface Address {
  city: string;
  state: string;
  locality?: string;
  area_code: string;
  street?: string;
}

export interface CustomMenu {
  name: string;
  short_desc?: string;
  long_desc?: string;
  images?: any[];
  type: string;
  display?: Display;
  custom_menu_id: string;
}

export interface Display {
  rank?: string;
}

export interface Fulfillment {
  id?: string;
  type?: string;
  contact?: Contact;
}

export interface Contact {
  phone?: string;
  email?: string;
}

export interface Gps {
  lat: number;
  lon: number;
}

interface OrderTiming {
  day: number;
  time_range: {
    gte: string;
    lte: string;
  };
}