import { AddressType } from '@/lib/api/common-types';
import { SelectedCustomizationType } from '@/lib/api/user/fetch-user-type';

export interface OnSelectCartResponseType {
  context: CheckoutContext;
  storeId: string;
  addressId: string;
  address: AddressType;
  store: CheckoutStore;
  sub_total: number;
  cartItemsCount: number;
  items: CheckoutItemType[];
  fulfillments: CheckoutFulfillment[];
  breakups: CheckoutBreakups;
  error?: { message: string };
}

export interface CheckoutContext {
  domain: string;
  action: string;
  country: string;
  city: string;
  core_version: string;
  bap_id: string;
  bap_uri: string;
  transaction_id: string;
  message_id: string;
  timestamp: string;
  bpp_uri: string;
  bpp_id: string;
}

export interface CheckoutStore {
  _id: string;
  address: Address;
  name: string;
  slug: string;
  symbol: string;
  provider_id: string;
  location_id: string;
}

export interface Address {
  city: string;
  state: string;
  locality?: string;
  area_code: string;
  street?: string;
}

export interface CheckoutItemType {
  id: string;
  catalog_id: string;
  customizable: boolean;
  product: Product;
  parent_item_id: string;
  dynamicId: string;
  cart_qty: number;
  instock: boolean;
  order_qty: number;
  available_quantity: number;
  unit_price: number;
  total_price: number;
  unit_max_price: number;
  total_max_price: number;
  selected_customizations: SelectedCustomizationType[];
  base?: Base;
  customizations?: Customization[];
}

export interface Product {
  slug: string;
  name: string;
  symbol: string;
  price: Price;
  quantity: number;
  instock: boolean;
  customizable: boolean;
  directlyLinkedCustomGroupIds: string[];
  diet_type: string;
  domain: string;
  category_id: string;
  cod: boolean;
  cancellable: boolean;
  returnable: boolean;
}

export interface Price {
  currency: string;
  value: number;
  range: Range;
  default_selection: DefaultSelection;
  maximum_value: number;
  offerPercent: number;
}

export interface Range {
  lower: string;
  upper: string;
}

export interface DefaultSelection {
  value: string;
  maximum_value: string;
}

export interface Base {
  instock: number;
  order_qty: number;
  available_quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Customization {
  id: string;
  optionId: string;
  groupId: string;
  name: string;
  instock: number;
  order_qty: number;
  available_quantity: number;
  unit_price: number;
  total_price: number;
}

export interface CheckoutFulfillment {
  id: string;
  type: string;
  provider_name: string;
  tracking: boolean;
  category: string;
  tat: string;
  serviceable: boolean;
}

export interface CheckoutBreakups {
  [key: string]: F1;
}

export interface F1 {
  breakups: Breakup[];
  total_savings: number;
  total: number;
}

export interface Breakup {
  title?: string;
  type?: string;
  price: number;
  id?: string;
  custom_title?: string;
  children?: Children[];
  level?: string;
}

export interface Children {
  custom_title: string;
  price: number;
  level: string;
  type: string;
  id?: string;
  title?: string;
}
