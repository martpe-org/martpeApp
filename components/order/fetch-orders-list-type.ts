export interface FetchOrdersListResponseType {
  orders: FetchOrdersListItemType[];
  page: number;
  count: number;
  size: number;
}

export interface FetchOrdersListItemType {
  _id: string;
  store_id: string;
  orderno: string;
  cancellable: boolean;
  status: string;
  delivery_address: DeliveryAddress;
  fulfillment: Fulfillment;
  total: number;
  sub_total: number;
  createdAt: string;
  store: Store;
  order_items: OrderItem[];
}

export interface DeliveryAddress {
  city: string;
  houseNo: string;
  street: string;
  gps: Gps;
  name: string;
  pincode: string;
  state: string;
  type: string;
  phone: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  lastUsed: boolean;
}

export interface Gps {
  lat: number;
  lon: number;
}

export interface Fulfillment {
  status: string;
}

export interface Store {
  _id: string;
  address: Address;
  name: string;
  orderTimings?: OrderTiming[];
  rating?: number;
  slug: string;
  status: string;
  symbol: string;
}

export interface Address {
  city: string;
  state: string;
  locality?: string;
  area_code: string;
  street?: string;
  name?: string;
  country?: string;
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
  order_qty: number;
  name: string;
  unit_price: number;
  total_price: number;
  unit_max_price?: number;
  total_max_price?: number;
  parent_item_id?: string;
  dynamicId?: string;
  base?: Base;
  customizations?: Customization[];
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
