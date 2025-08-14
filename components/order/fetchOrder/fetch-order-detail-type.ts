export interface FetchOrderDeliveryAddresType {
  city: string;
  houseNo: string;
  street: string;
  gps: Gps;
  name: string;
  pincode: string;
  state: string;
  type: string;
  phone: string;
  lastUsed: boolean;
}

export interface Gps {
  lat: number;
  lon: number;
}

export interface BillingAddress {
  name: string;
  address: Address;
  phone: string;
}

export interface Address {
  name: string;
  building?: string;
  locality: string;
  city: string;
  state: string;
  country: string;
  area_code: string;
}

export interface Context {
  bpp_id: string;
  bpp_uri: string;
  city: string;
  core_version: string;
  country: string;
  domain: string;
  transaction_id: string;
}

export interface Fulfillment {
  id: string;
  type: string;
  status: string;
  provider_name?: string;
  category?: string;
  tat?: string;
  tracking?: boolean;
  timestamp?: string;
  routing?: string;
  trackingDetails?: TrackingDetails;
  agent?: any;
  vehicle?: any;
  authorization?: any;
}

export interface TrackingDetails {
  gps_enabled?: boolean;
  url_enabled?: boolean;
  url?: string;
}

interface CancellationTerms {
  fulfillment_state: {
    descriptor: {
      code: string;
      short_desc: string;
    };
  };
  cancellation_fee: {
    percentage: string;
    amount: Price;
  };
}

interface Tag {
  code: string;
  list: TagList[];
}

interface TagList {
  code: string;
  value: string;
}

interface Return {
  _id: string;
  quantity: number;
  code: string;
  desc: string;
  images: string[];
  ttl_approval: string;
  ttl_reverseqc: string;
  status: string;
  fulfillment_history?: {
    _id: string;
    type: string;
    state: {
      descriptor: {
        code: string;
      };
    };
    tags: Tag[];
    status: string;
  }[];
  refund?: {
    acquirer_data: {
      rrn: string;
    };
    amount: number;
    batch_id: string | null;
    created_at: number; // Unix timestamp
    currency: string;
    entity: string;
    _id: string;
    notes: {
      orderId: string;
      type: string;
    };
    payment_id: string;
    receipt: string;
    speed_processed: string;
    speed_requested: string;
    status: string;
  };
  breakup?: { title: string; price: string }[];
}

type Cancellation = {
  initiated_by: string;
  code: string;
  status: string;
  refund: {
    id: string;
    entity: string;
    amount: number;
    currency: string;
    payment_id: string;
    notes: {
      orderId: string;
    };
    receipt: string;
    acquirer_data: {
      arn: string | null;
    };
    created_at: number;
    batch_id: string;
    status: string;
    speed_processed: string;
    speed_requested: string;
  };
  id: string;
  cancel_request: any;
};

// Fulfillment History Interface
interface FulfillmentHistory {
  _id: string;
  orderId: string;
  status: string;
  type: string;
  state: {
    descriptor: {
      code: string;
    };
  };
  '@ondc/org/provider_name': string;
  tracking: boolean;
}

export interface Breakup {
  title?: string;
  type?: string;
  price: number;
  id?: string;
  custom_title?: string;
  children?: Children[];
}

export interface Children {
  custom_title: string;
  price: number;
  level: string;
  type: string;
  id?: string;
  title?: string;
}

export interface Store {
  _id: string;
  address: Address2;
  name: string;
  orderTimings?: OrderTiming[];
  rating?: number;
  slug: string;
  status: string;
  symbol: string;
  gps: {
    lat: number;
    lon: number;
  };
}

export interface Address2 {
  city: string;
  state: string;
  locality?: string;
  area_code: string;
  street?: string;
}

interface OrderTiming {
  day: number;
  time_range: {
    gte: string;
    lte: string;
  };
}

export interface OrderItem {
  _id: string;
  order_id: string;
  user_id: string;
  product_slug: string;
  catalog_id: string;
  customizable: boolean;
  product: Product;
  order_qty: number;
  name: string;
  unit_price: number;
  total_price: number;
  unit_max_price: number;
  total_max_price: number;
  parent_item_id?: string;
  dynamicId?: string;
  base?: Base;
  customizations?: Customization[];
  return?: Return;
  partial_cancel?: any;
}

export interface Product {
  _id: string;

  catalog_id: string;
  category: string;
  category_id: string;
  createdAt: string;
  custom_menu_id?: string[];
  customizable: boolean;
  diet_type: string;
  directlyLinkedCustomGroupIds?: string[];
  domain: string;

  images: string[];
  instock: boolean;
  location_id: string;
  long_desc?: string;
  meta: Meta;
  name: string;
  price: Price;
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
  store: Store2;
  store_id: string;
  store_status: string;
  store_status_timestamp: string;
  symbol: string;
  tts_in_h: number;
  type: string;
  unitized?: Unitized;
  updatedAt: string;
  vendor_id: string;
}

export interface Meta {
  returnable: boolean;
  cancellable: boolean;
  return_window?: string;
  seller_pickup_return?: boolean;
  time_to_ship?: string;
  available_on_cod?: boolean;
  contact_details_consumer_care?: string;
}

export interface Price {
  currency: string;
  value: number;
  maximum_value?: number;
  offerPercent?: number;
}

export interface Store2 {
  name: string;
  symbol: string;
  address: Address3;
  rating?: number;
  slug: string;
}

export interface Address3 {
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

export interface Base {
  unit_price: number;
  total_price: number;
}

export interface Customization {
  custom_item_id: string;
  optionId: string;
  groupId: string;
  name: string;
  order_qty: number;
  unit_price: number;
  total_price: number;
}

export interface FetchOrderDetailType {
  _id: string;
  transaction_id: string;
  user_id: string;
  store_id: string;
  orderno: string;
  cancellation_terms: CancellationTerms[];
  cancellable: boolean;
  cancellation: Cancellation;
  status: string;
  state: string;
  delivery_address: FetchOrderDeliveryAddresType;
  billing_address: BillingAddress;
  context: Context;
  fulfillment: Fulfillment;
  total: number;
  sub_total: number;
  breakup: Breakup[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  store: Store;
  order_items: OrderItem[];
  fulfillment_history: FulfillmentHistory[];
  refunds: any;
}
